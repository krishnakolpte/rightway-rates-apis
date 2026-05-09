let userRequests = 0;

function trackUser() {
	userRequests++;
}

function getCounts() {
	return { userRequests };
}

module.exports = { trackUser, getCounts };
