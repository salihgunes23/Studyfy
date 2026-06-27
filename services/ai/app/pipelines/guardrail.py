"""Guardrail mekanizmaları — zero-hallucination'ın temel taşı.

Tam guardrail mimarisi: docs/AI_PROMPTS.md §Guardrail Mimarisi.
"""

from enum import Enum

# Retrieval boş/zayıfsa üretimi reddet (cosine benzerlik eşiği).
RETRIEVAL_MIN_SCORE = 0.2


class GuardrailDecision(str, Enum):
    PROCEED = "proceed"
    REFUSE = "refuse"


def retrieval_guardrail(
    scores: list[float], min_score: float = RETRIEVAL_MIN_SCORE
) -> GuardrailDecision:
    """En iyi retrieval skoru eşiğin altındaysa (veya hiç sonuç yoksa) üretimi reddet.

    Bu kapı, modelin kullanıcının verisi dışından 'uydurmasını' engeller.
    """
    if not scores:
        return GuardrailDecision.REFUSE
    if max(scores) < min_score:
        return GuardrailDecision.REFUSE
    return GuardrailDecision.PROCEED
