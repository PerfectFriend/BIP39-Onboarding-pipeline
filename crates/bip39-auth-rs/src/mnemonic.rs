//! BIP-39 Mnemonic and Seed Generation with Enhanced Challenge Verification

use bip39::{Language, Mnemonic};
use rand::seq::SliceRandom;
use rand::Rng;
use serde::{Deserialize, Serialize};
use zeroize::Zeroize;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum WordCount {
    Words12 = 12,
    Words24 = 24,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MnemonicConfig {
    pub word_count: WordCount,
    pub language: String,
}

impl Default for MnemonicConfig {
    fn default() -> Self {
        Self {
            word_count: WordCount::Words12,
            language: "english".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerificationChallenge {
    pub word_index: usize,
    pub display_number: usize,
    pub correct_word: String,
    pub options: Vec<String>,
}

/// Generate a fresh BIP-39 mnemonic string
pub fn generate_mnemonic_phrase(count: WordCount) -> Result<String, String> {
    let mut rng = rand::thread_rng();
    let entropy_bytes = match count {
        WordCount::Words12 => 16, // 128 bits
        WordCount::Words24 => 32, // 256 bits
    };

    let mut entropy = vec![0u8; entropy_bytes];
    rng.fill(&mut entropy[..]);

    let mnemonic = Mnemonic::from_entropy_in(Language::English, &entropy)
        .map_err(|e| format!("Entropy generation error: {}", e))?;

    // Zeroize raw entropy buffer immediately
    entropy.zeroize();

    Ok(mnemonic.to_string())
}

/// Generate 3 verification challenges.
///
/// In case of an error during verification, passing `exclude_indices` ensures that
/// the regenerated challenges pick DIFFERENT word positions and fresh random distractors,
/// preventing brute-force elimination guessing.
pub fn generate_verification_challenges(
    words: &[String],
    exclude_indices: &[usize],
) -> Result<Vec<VerificationChallenge>, String> {
    if words.len() < 3 {
        return Err("Mnemonic must contain at least 3 words".to_string());
    }

    let mut rng = rand::thread_rng();
    let total = words.len();
    let target_count = 3.min(total);

    let all_indices: Vec<usize> = (0..total).collect();
    let mut candidate_pool: Vec<usize> = all_indices
        .iter()
        .copied()
        .filter(|i| !exclude_indices.contains(i))
        .collect();

    candidate_pool.shuffle(&mut rng);

    let mut chosen_indices: Vec<usize> = candidate_pool.into_iter().take(target_count).collect();

    // If candidate pool had fewer than 3 words (rare), fill remaining from all indices
    if chosen_indices.len() < target_count {
        let mut fallback: Vec<usize> = all_indices
            .into_iter()
            .filter(|i| !chosen_indices.contains(i))
            .collect();
        fallback.shuffle(&mut rng);
        for idx in fallback {
            if chosen_indices.len() < target_count {
                chosen_indices.push(idx);
            }
        }
    }

    chosen_indices.sort();

    // Canonical BIP-39 English Wordlist references for distractors
    let wordlist = bip39::Language::English.word_list();

    let mut challenges = Vec::new();

    for &word_index in &chosen_indices {
        let correct_word = words[word_index].clone();
        let mut distractors = std::collections::HashSet::new();

        while distractors.len() < 4 {
            let random_pick = wordlist[rng.gen_range(0..wordlist.len())].to_string();
            if random_pick != correct_word {
                distractors.insert(random_pick);
            }
        }

        let mut options: Vec<String> = std::iter::once(correct_word.clone())
            .chain(distractors.into_iter())
            .collect();

        // Fisher-Yates shuffle options
        options.shuffle(&mut rng);

        challenges.push(VerificationChallenge {
            word_index,
            display_number: word_index + 1,
            correct_word,
            options,
        });
    }

    Ok(challenges)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_12_words() {
        let m = generate_mnemonic_phrase(WordCount::Words12).unwrap();
        let words: Vec<&str> = m.split_whitespace().collect();
        assert_eq!(words.len(), 12);
    }

    #[test]
    fn test_verification_challenges_exclude() {
        let m = generate_mnemonic_phrase(WordCount::Words12).unwrap();
        let words: Vec<String> = m.split_whitespace().map(|s| s.to_string()).collect();

        let first_run = generate_verification_challenges(&words, &[]).unwrap();
        let first_indices: Vec<usize> = first_run.iter().map(|c| c.word_index).collect();

        // Second run excluding previous indices
        let second_run = generate_verification_challenges(&words, &first_indices).unwrap();
        let second_indices: Vec<usize> = second_run.iter().map(|c| c.word_index).collect();

        // Must pick different word indices
        for idx in &second_indices {
            assert!(!first_indices.contains(idx));
        }
    }
}
