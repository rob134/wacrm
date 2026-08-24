import json
import os
import re
import time
from pathlib import Path

from openai import OpenAI


# ============================================================
# CONFIGURAÇÃO
# ============================================================

EN_FILE = Path("messages/en.json")
PT_FILE = Path("messages/pt.json")
OUTPUT_FILE = Path("messages/pt_translated.json")

# Coloque aqui o ID EXATO do modelo NVIDIA que você escolheu.
MODEL = "meta/llama-3.1-8b-instruct"

NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"

# Menor = mais seguro para modelos menores
BATCH_SIZE = 25


# ============================================================
# API
# ============================================================

API_KEY = os.getenv("NVIDIA_API_KEY")

if not API_KEY:
    raise RuntimeError(
        "\nNVIDIA_API_KEY não encontrada.\n\n"
        "No PowerShell execute:\n"
        '$env:NVIDIA_API_KEY="nvapi-SUA-NOVA-CHAVE"\n'
    )

client = OpenAI(
    base_url=NVIDIA_BASE_URL,
    api_key=API_KEY
)


# ============================================================
# FLATTEN
# ============================================================

def flatten(value, prefix=""):
    result = []
    if isinstance(value, dict):
        for key, child in value.items():
            path = f"{prefix}.{key}" if prefix else key
            result.extend(flatten(child, path))
    elif isinstance(value, str):
        result.append((prefix, value))
    return result


# ============================================================
# UNFLATTEN (reconstruir estrutura aninhada)
# ============================================================

def unflatten(items):
    result = {}
    for path, value in items:
        parts = path.split(".")
        node = result
        for part in parts[:-1]:
            node = node.setdefault(part, {})
        node[parts[-1]] = value
    return result


# ============================================================
# CARREGAR ARQUIVOS
# ============================================================

print()
print("=" * 70)
print(" WACRM — NVIDIA TRANSLATOR")
print("=" * 70)
print()

if not EN_FILE.exists():
    raise FileNotFoundError(f"Arquivo não encontrado: {EN_FILE}")

if not PT_FILE.exists():
    raise FileNotFoundError(f"Arquivo não encontrado: {PT_FILE}")


with open(EN_FILE, "r", encoding="utf-8") as f:
    en = json.load(f)

with open(PT_FILE, "r", encoding="utf-8") as f:
    pt = json.load(f)


en_items = flatten(en)
pt_items = dict(flatten(pt))


# ============================================================
# RETOMAR PROGRESSO ANTERIOR (se existir)
# ============================================================

if OUTPUT_FILE.exists():
    with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
        previous = json.load(f)
    for key, value in flatten(previous):
        pt_items[key] = value
    print(f"Progresso anterior carregado de: {OUTPUT_FILE}")

print(f"Strings EN: {len(en_items)}")
print(f"Strings PT: {len(pt_items)}")


# ============================================================
# ENCONTRAR PENDENTES
# ============================================================

pending = []

for key, english in en_items:
    if not isinstance(english, str):
        continue
    portuguese = pt_items.get(key)
    if portuguese is None:
        pending.append((key, english))
        continue
    if not isinstance(portuguese, str):
        pending.append((key, english))
        continue
    if not portuguese.strip():
        pending.append((key, english))
        continue
    # Ainda exatamente igual ao inglês
    if portuguese.strip() == english.strip():
        pending.append((key, english))

print(f"Strings pendentes: {len(pending)}")
print()

if not pending:
    print("Nada para traduzir.")
    raise SystemExit(0)


# ============================================================
# PROMPT
# ============================================================

SYSTEM_PROMPT = r"""
You are a professional software localization translator.

Translate English UI strings into natural Brazilian Portuguese (pt-BR).

VERY IMPORTANT:

Return ONLY a valid JSON array.

The number and order of translated strings MUST be exactly
the same as the input.

Do not add explanations.

Do not add markdown.

Do not add comments.

Do not remove strings.

Do not create additional strings.

TRANSLATION RULES:

1. Translate only human-readable text.
2. Preserve variable placeholders exactly.
3. Preserve HTML tags exactly.
4. Preserve URLs exactly.
5. Preserve technical identifiers when they are identifiers.
6. Preserve punctuation where appropriate.
7. Use natural Brazilian Portuguese.
8. Keep UI terminology consistent.

PLACEHOLDERS:

These must NOT be translated:

{name}
{count}
{url}
{email}
{value}
{{1}}
{{2}}
{inserted}
{updated}

For example:

"Hello {name}"

must become:

"Olá {name}"

NOT:

"Olá {nome}"

------------------------------------------------------------

ICU MESSAGEFORMAT:

Some strings use ICU syntax.

Example:

"{count, plural, =1 {option} other {options}}"

Correct translation:

"{count, plural, =1 {opção} other {opções}}"

IMPORTANT:

DO NOT translate ICU control identifiers such as:

count
plural
select
selectordinal
one
other
zero
two
few
many

Translate only the human-readable text inside the ICU branches.

For example:

"{count, plural, =1 {option} other {options}}"

becomes:

"{count, plural, =1 {opção} other {opções}}"

NOT:

"{contagem, plural, =1 {opção} other {opções}}"

------------------------------------------------------------

HTML:

Preserve HTML tags.

Example:

"<strong>{name}</strong>"

becomes:

"<strong>{name}</strong>"

with only human text translated if there is any.

------------------------------------------------------------

TECHNICAL TERMS:

Keep these when appropriate:

API
JSON
CSV
UUID
OAuth
Webhook
WhatsApp
CRM
URL
HTTP
HTTPS

------------------------------------------------------------

OUTPUT:

Input:

[
  "Assign",
  "Cancel reply",
  "{count, plural, =1 {option} other {options}}"
]

Output:

[
  "Atribuir",
  "Cancelar resposta",
  "{count, plural, =1 {opção} other {opções}}"
]
"""

# ============================================================
# VALIDAR E CORRIGIR UMA TRADUÇÃO AUTOMATICAMENTE
# ============================================================

def validate_and_fix_translation(original, translated):
    if not isinstance(translated, str):
        return False, translated, "Tradução não é string."

    # Busca placeholders no padrão {variavel} ou {{variavel}}
    pattern = r'\{\{[^{}]+\}\}|\{[a-zA-Z_][a-zA-Z0-9_.-]*\}'
    orig_vars = re.findall(pattern, original)
    trans_vars = re.findall(pattern, translated)

    # Se a IA traduziu a variável (ex: trocou {updated} por {atualizado}),
    # forçamos a substituição de volta para o nome original em inglês.
    if len(orig_vars) == len(trans_vars) and orig_vars != trans_vars:
        for t_var, o_var in zip(trans_vars, orig_vars):
            translated = translated.replace(t_var, o_var)

    return True, translated, ""


# ============================================================
# DIVIDIR EM LOTES
# ============================================================

batches = [
    pending[i:i + BATCH_SIZE]
    for i in range(
        0,
        len(pending),
        BATCH_SIZE
    )
]

print(f"Total de chamadas NVIDIA: {len(batches)}\n")


# ============================================================
# SALVAR (mescla pt.json + traduções, estrutura completa)
# ============================================================

def save_output(translated_map):
    merged = dict(pt_items)
    merged.update(translated_map)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(
            unflatten(merged.items()),
            f,
            ensure_ascii=False,
            indent=2
        )
        f.write("\n")


# ============================================================
# TRADUZIR UM LOTE (com retry)
# ============================================================

MAX_RETRIES = 3

def translate_batch(values):

    user_prompt = json.dumps(
        values,
        ensure_ascii=False,
        indent=2
    )

    last_error = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": SYSTEM_PROMPT
                    },
                    {
                        "role": "user",
                        "content": user_prompt
                    }
                ],
                temperature=0,
                max_tokens=8000
            )

            choice = response.choices[0]

            if choice.finish_reason == "length":
                raise RuntimeError("Resposta truncada (max_tokens).")

            raw = choice.message.content.strip()

            # ------------------------------------------------
            # REMOVER MARKDOWN
            # ------------------------------------------------

            if raw.startswith("```"):
                raw = re.sub(
                    r"^```(?:json)?\s*",
                    "",
                    raw,
                    flags=re.IGNORECASE
                )
                raw = re.sub(
                    r"\s*```$",
                    "",
                    raw
                )
                raw = raw.strip()

            # ------------------------------------------------
            # JSON
            # ------------------------------------------------

            result = json.loads(raw)

            if not isinstance(result, list):
                raise RuntimeError("A resposta não é um array JSON.")

            if len(result) != len(values):
                raise RuntimeError(
                    "Quantidade incorreta de traduções. "
                    f"Esperado: {len(values)} "
                    f"Recebido: {len(result)}"
                )

            # ------------------------------------------------
            # VALIDAR E CORRIGIR CADA STRING
            # ------------------------------------------------

            for index, original in enumerate(values):

                translation = result[index]

                valid, fixed_translation, reason = validate_and_fix_translation(
                    original,
                    translation
                )

                if not valid:
                    raise RuntimeError(
                        "Tradução rejeitada pelo validador.\n"
                        f"Original : {original}\n"
                        f"Tradução : {translation}\n"
                        f"{reason}"
                    )

                # Aplica a tradução com as variáveis corrigidas
                result[index] = fixed_translation

            return result

        except Exception as error:
            last_error = error
            print(f"  ⚠ Tentativa {attempt}/{MAX_RETRIES} falhou: {error}")

            if attempt < MAX_RETRIES:
                time.sleep(2 * attempt)

    raise RuntimeError(
        f"Lote falhou após {MAX_RETRIES} tentativas.\n"
        f"Último erro: {last_error}"
    )


# ============================================================
# TRADUZIR
# ============================================================

translated_map = {}

for batch_number, batch in enumerate(batches, start=1):
    values = [value for _, value in batch]
    print(f"[{batch_number}/{len(batches)}] Traduzindo {len(values)} strings...")

    result = translate_batch(values)

    for (key, _), translation in zip(batch, result):
        translated_map[key] = translation

    # Salva progresso incremental (espelho completo do pt.json)
    save_output(translated_map)

    print("  ✓ OK (progresso salvo)")
    time.sleep(0.5)


# ============================================================
# SALVAR (final)
# ============================================================

save_output(translated_map)


# ============================================================
# FINAL
# ============================================================

print()
print("=" * 70)
print(" TRADUÇÃO CONCLUÍDA")
print("=" * 70)
print()

print(f"Strings traduzidas: {len(translated_map)}")
print(f"Arquivo gerado: {OUTPUT_FILE}")
print()
print("O pt.json original NÃO foi alterado.")
print("O arquivo gerado é um ESPELHO COMPLETO do pt.json")
print("(estrutura + chaves), já com as novas traduções.")
print()