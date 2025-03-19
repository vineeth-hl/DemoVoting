document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const verificationSection = document.getElementById('verificationSection');
    const ballotSection = document.getElementById('ballotSection');
    const confirmationSection = document.getElementById('confirmationSection');
    const verificationMessage = document.getElementById('verificationMessage');
    const tokenForm = document.getElementById('tokenForm');
    const startScannerBtn = document.getElementById('startScannerBtn');
    const qrScanner = document.getElementById('qrScanner');
    const ballotForm = document.getElementById('ballotForm');
    const candidatesList = document.getElementById('candidatesList');
    const cancelVoteBtn = document.getElementById('cancelVoteBtn');
    const electionTitle = document.getElementById('electionTitle');
    const electionDescription = document.getElementById('electionDescription');
    const electionDates = document.getElementById('electionDates');
    
    // Current election and voter data
    let currentElection = null;
    let currentVoter = null;
    let html5QrCode = null;
    
    // Initialize QR scanner
    startScannerBtn.addEventListener('click', function() {
        if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop();
            startScannerBtn.textContent = 'Start Scanner';
            return;
        }
        
        // Clear scanner container
        qrScanner.innerHTML = '';
        
        // Create QR scanner
        html5QrCode = new Html5Qrcode(qrScanner.id);
        
        html5QrCode.start(
            { facingMode: "environment" },
            {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            },
            (decodedText) => {
                // Handle successful scan
                handleQRCodeScan(decodedText);
                
                // Stop scanning after successful scan
                if (html5QrCode.isScanning) {
                    html5QrCode.stop();
                    startScannerBtn.textContent = 'Start Scanner';
                }
            },
            (errorMessage) => {
                // Handle error (ignore)
            }
        ).catch((err) => {
            showVerificationMessage('Camera access denied or not available. Please use the token entry method.', 'error');
        });
        
        startScannerBtn.textContent = 'Stop Scanner';
    });
    
    // Handle QR code scan
    function handleQRCodeScan(decodedText) {
        try {
            // QR code format should be: https://e-voting.com/vote?election=ELECTION_ID&token=VOTER_TOKEN
            const url = new URL(decodedText);
            const params = new URLSearchParams(url.search);
            const electionId = params.get('election');
            const voterToken = params.get('token');
            
            if (!electionId || !voterToken) {
                showVerificationMessage('Invalid QR code format. Please try again.', 'error');
                return;
            }
            
            // Verify voter
            verifyVoter(electionId, voterToken);
        } catch (error) {
            showVerificationMessage('Invalid QR code. Please try again.', 'error');
        }
    }
    
    // Handle token form submission
    tokenForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const electionId = document.getElementById('electionId').value.trim();
        const voterToken = document.getElementById('voterToken').value.trim();
        
        if (!electionId || !voterToken) {
            showVerificationMessage('Please enter both Election ID and Voter Token.', 'error');
            return;
        }
        
        // Verify voter
        verifyVoter(electionId, voterToken);
    });
    
    // Verify voter and election
    function verifyVoter(electionId, voterToken) {
        // Get elections from localStorage
        const elections = JSON.parse(localStorage.getItem('elections')) || [];
        
        // Find the election
        const election = elections.find(e => e.id === electionId);
        
        if (!election) {
            showVerificationMessage('Election not found. Please check the Election ID.', 'error');
            return;
        }
        
        // Check if election is active
        const now = new Date();
        const startDate = new Date(election.startDate);
        const endDate = new Date(election.endDate);
        
        if (now < startDate) {
            showVerificationMessage(`This election has not started yet. It will begin on ${formatDate(startDate)}.`, 'error');
            return;
        }
        
        if (now > endDate) {
            showVerificationMessage(`This election has ended on ${formatDate(endDate)}.`, 'error');
            return;
        }
        
        // Check if voter access is restricted
        if (election.voterAccess && election.voterAccess.type === 'restricted') {
            // Find the voter
            const voter = election.voterAccess.authorizedVoters.find(v => v.token === voterToken);
            
            if (!voter) {
                showVerificationMessage('Invalid voter token. Please check and try again.', 'error');
                return;
            }
            
            // Check if voter has already voted
            if (voter.hasVoted) {
                showVerificationMessage('You have already voted in this election.', 'error');
                return;
            }
            
            // Store current election and voter
            currentElection = election;
            currentVoter = voter;
            
            // Show ballot
            showBallot(election);
        } else {
            // Open election - anyone can vote
            // Check if user is logged in
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            
            if (!currentUser) {
                showVerificationMessage('Please log in to vote in this election.', 'error');
                return;
            }
            
            // Check if user has already voted
            const hasVoted = election.votes.some(vote => vote.voterId === currentUser.email);
            
            if (hasVoted) {
                showVerificationMessage('You have already voted in this election.', 'error');
                return;
            }
            
            // Store current election and voter
            currentElection = election;
            currentVoter = { id: currentUser.email };
            
            // Show ballot
            showBallot(election);
        }
    }
    
    // Show ballot
    function showBallot(election) {
        // Update ballot information
        electionTitle.textContent = election.title;
        electionDescription.textContent = election.description;
        electionDates.textContent = `${formatDate(new Date(election.startDate))} - ${formatDate(new Date(election.endDate))}`;
        
        // Clear candidates list
        candidatesList.innerHTML = '';
        
        // Add candidates to ballot
        election.candidates.forEach(candidate => {
            const candidateOption = document.createElement('div');
            candidateOption.className = 'candidate-option';
            candidateOption.innerHTML = `
                <input type="radio" name="candidate" id="candidate-${candidate.id}" value="${candidate.id}" class="candidate-radio">
                <div class="candidate-info">
                    <div class="candidate-name">${candidate.name}</div>
                    <div class="candidate-party">${candidate.party}</div>
                </div>
            `;
            
            // Add click event to select candidate
            candidateOption.addEventListener('click', function() {
                // Remove selected class from all options
                document.querySelectorAll('.candidate-option').forEach(option => {
                    option.classList.remove('selected');
                });
                
                // Add selected class to clicked option
                candidateOption.classList.add('selected');
                
                // Check the radio button
                candidateOption.querySelector('input[type="radio"]').checked = true;
            });
            
            candidatesList.appendChild(candidateOption);
        });
        
        // Hide verification section and show ballot section
        verificationSection.style.display = 'none';
        ballotSection.style.display = 'block';
        confirmationSection.style.display = 'none';
    }
    
    // Handle ballot form submission
    ballotForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get selected candidate
        const selectedCandidate = document.querySelector('input[name="candidate"]:checked');
        
        if (!selectedCandidate) {
            alert('Please select a candidate to vote.');
            return;
        }
        
        const candidateId = parseInt(selectedCandidate.value);
        
        // Record vote
        recordVote(candidateId);
    });
    
    // Record vote
    function recordVote(candidateId) {
        // Get elections from localStorage
        const elections = JSON.parse(localStorage.getItem('elections')) || [];
        
        // Find the election
        const electionIndex = elections.findIndex(e => e.id === currentElection.id);
        
        if (electionIndex === -1) {
            alert('Election not found. Please try again.');
            return;
        }
        
        // Update election data
        const election = elections[electionIndex];
        
        // Find candidate and increment vote count
        const candidateIndex = election.candidates.findIndex(c => c.id === candidateId);
        
        if (candidateIndex === -1) {
            alert('Candidate not found. Please try again.');
            return;
        }
        
        election.candidates[candidateIndex].voteCount++;
        
        // Record vote
        election.votes.push({
            voterId: currentVoter.id,
            candidateId: candidateId,
            timestamp: new Date().toISOString()
        });
        
        // If restricted access, mark voter as voted
        if (election.voterAccess && election.voterAccess.type === 'restricted') {
            const voterIndex = election.voterAccess.authorizedVoters.findIndex(v => v.id === currentVoter.id);
            
            if (voterIndex !== -1) {
                election.voterAccess.authorizedVoters[voterIndex].hasVoted = true;
                election.voterAccess.authorizedVoters[voterIndex].votedAt = new Date().toISOString();
            }
        }
        
        // Save updated elections to localStorage
        localStorage.setItem('elections', JSON.stringify(elections));
        
        // Show confirmation
        showConfirmation();
    }
    
    // Show confirmation
    function showConfirmation() {
        verificationSection.style.display = 'none';
        ballotSection.style.display = 'none';
        confirmationSection.style.display = 'block';
    }
    
    // Cancel vote
    cancelVoteBtn.addEventListener('click', function() {
        // Reset current election and voter
        currentElection = null;
        currentVoter = null;
        
        // Show verification section
        verificationSection.style.display = 'block';
        ballotSection.style.display = 'none';
        confirmationSection.style.display = 'none';
    });
    
    // Helper function to show verification message
    function showVerificationMessage(message, type) {
        verificationMessage.textContent = message;
        verificationMessage.className = 'verification-message ' + type;
        verificationMessage.style.display = 'block';
    }
    
    // Helper function to format date
    function formatDate(date) {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    }
    
    // Check for election and token in URL parameters
    function checkUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const electionId = urlParams.get('election');
        const voterToken = urlParams.get('token');
        
        if (electionId && voterToken) {
            // Auto-fill the form
            document.getElementById('electionId').value = electionId;
            document.getElementById('voterToken').value = voterToken;
            
            // Verify voter
            verifyVoter(electionId, voterToken);
        }
    }
    
    // Check URL parameters on page load
    checkUrlParameters();
}); 