package faker

import "math/rand"

func CreateDistribution(selectionAmount int, biasedTowardsIndex int, totalVotes int, bias float64, spread float64) []int {
	distribution := make([]int, selectionAmount)

	weights := make([]float64, selectionAmount)

	// Step 1: Generate weights
	for i := 0; i < selectionAmount; i++ {
		if i == biasedTowardsIndex {
			weights[i] = rand.Float64()*spread + bias
		} else {
			weights[i] = rand.Float64()*spread + 0.5
		}
	}

	// Step 2: Normalize into vote counts
	var weightSum float64
	for _, w := range weights {
		weightSum += w
	}

	votesLeft := totalVotes
	for i := 0; i < selectionAmount; i++ {
		voteCount := int((weights[i] / weightSum) * float64(totalVotes))
		distribution[i] = voteCount
		votesLeft -= voteCount
	}

	// Step 3: Distribute leftover votes randomly
	for votesLeft > 0 {
		idx := rand.Intn(selectionAmount)
		distribution[idx]++
		votesLeft--
	}

	return distribution
}
