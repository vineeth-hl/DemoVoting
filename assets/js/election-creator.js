// Election Creator JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        // Redirect to login page if not logged in
        window.location.href = 'login.html';
        return;
    }

    // Initialize form elements
    const electionForm = document.getElementById('electionForm');
    const candidatesContainer = document.getElementById('candidatesContainer');
    const addCandidateBtn = document.getElementById('addCandidateBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const formMessage = document.querySelector('.election-form-message');
    
    // Voter management elements
    const voterAccessType = document.getElementById('voterAccessType');
    const restrictedVotersSection = document.getElementById('restrictedVotersSection');
    const votersFile = document.getElementById('votersFile');
    const votersList = document.getElementById('votersList');
    const generateQrCodes = document.getElementById('generateQrCodes');
    
    // Set minimum date for date inputs to today
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    // Set default dates (start: tomorrow, end: 7 days from tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(tomorrow);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    // Format dates for datetime-local input
    startDateInput.value = formatDateForInput(tomorrow);
    endDateInput.value = formatDateForInput(nextWeek);
    
    // Add event listener for adding new candidates
    addCandidateBtn.addEventListener('click', function() {
        addCandidateField();
    });
    
    // Toggle restricted voters section based on voter access type
    voterAccessType.addEventListener('change', function() {
        if (this.value === 'restricted') {
            restrictedVotersSection.style.display = 'block';
        } else {
            restrictedVotersSection.style.display = 'none';
        }
    });
    
    // Handle CSV file upload
    votersFile.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            parseCSVFile(file);
        }
    });
    
    // Parse CSV file and populate voters list
    function parseCSVFile(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const csv = e.target.result;
            const lines = csv.split('\n');
            
            // Skip header row and get voter IDs
            const voterIds = [];
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line) {
                    const columns = line.split(',');
                    if (columns.length > 0 && columns[0].trim()) {
                        voterIds.push(columns[0].trim());
                    }
                }
            }
            
            // Update voters list textarea
            votersList.value = voterIds.join('\n');
            
            showMessage(`Successfully imported ${voterIds.length} voter IDs from CSV`, 'success');
        };
        reader.readAsText(file);
    }
    
    // Enable the first remove button if there's more than one candidate
    function updateRemoveButtons() {
        const removeButtons = document.querySelectorAll('.remove-candidate');
        if (removeButtons.length > 1) {
            removeButtons.forEach(button => {
                button.disabled = false;
            });
        } else {
            removeButtons[0].disabled = true;
        }
    }
    
    // Add a new candidate field
    function addCandidateField() {
        const candidateItem = document.createElement('div');
        candidateItem.className = 'candidate-item';
        candidateItem.innerHTML = `
            <div class="form-group">
                <input type="text" name="candidateName[]" placeholder="Candidate name" required>
            </div>
            <div class="form-group">
                <input type="text" name="candidateParty[]" placeholder="Party/Affiliation (optional)">
            </div>
            <button type="button" class="remove-candidate"><i class="fas fa-trash-alt"></i> Remove</button>
        `;
        
        // Add event listener to remove button
        const removeButton = candidateItem.querySelector('.remove-candidate');
        removeButton.addEventListener('click', function() {
            candidateItem.remove();
            updateRemoveButtons();
        });
        
        candidatesContainer.appendChild(candidateItem);
        updateRemoveButtons();
    }
    
    // Handle form submission
    electionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate dates
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);
        const now = new Date();
        
        if (startDate <= now) {
            showMessage('Start date must be in the future', 'error');
            return;
        }
        
        if (endDate <= startDate) {
            showMessage('End date must be after start date', 'error');
            return;
        }
        
        // Collect form data
        const electionData = {
            id: generateUniqueId(),
            title: document.getElementById('electionTitle').value,
            type: document.getElementById('electionType').value,
            description: document.getElementById('electionDescription').value,
            startDate: startDateInput.value,
            endDate: endDateInput.value,
            createdBy: currentUser.email,
            createdAt: new Date().toISOString(),
            isPublic: document.getElementById('isPublic').checked,
            showResults: document.getElementById('showResults').checked,
            allowComments: document.getElementById('allowComments').checked,
            status: 'upcoming',
            candidates: [],
            votes: [],
            voterAccess: {
                type: voterAccessType.value,
                idType: voterAccessType.value === 'restricted' ? document.getElementById('voterIdType').value : null,
                generateQrCodes: voterAccessType.value === 'restricted' ? generateQrCodes.checked : false,
                authorizedVoters: []
            }
        };
        
        // Collect candidates
        const candidateNames = document.querySelectorAll('input[name="candidateName[]"]');
        const candidateParties = document.querySelectorAll('input[name="candidateParty[]"]');
        
        for (let i = 0; i < candidateNames.length; i++) {
            if (candidateNames[i].value.trim() !== '') {
                electionData.candidates.push({
                    id: i + 1,
                    name: candidateNames[i].value.trim(),
                    party: candidateParties[i].value.trim() || 'Independent',
                    voteCount: 0
                });
            }
        }
        
        // Validate that we have at least 2 candidates
        if (electionData.candidates.length < 2) {
            showMessage('You must add at least 2 candidates', 'error');
            return;
        }
        
        // Process authorized voters if restricted access
        if (electionData.voterAccess.type === 'restricted') {
            const voterIdsText = votersList.value.trim();
            if (!voterIdsText) {
                showMessage('You must provide a list of authorized voters for restricted elections', 'error');
                return;
            }
            
            const voterIds = voterIdsText.split('\n').map(id => id.trim()).filter(id => id);
            if (voterIds.length === 0) {
                showMessage('You must provide at least one authorized voter', 'error');
                return;
            }
            
            // Create voter records with unique tokens for QR codes
            voterIds.forEach(voterId => {
                electionData.voterAccess.authorizedVoters.push({
                    id: voterId,
                    token: generateVoterToken(),
                    hasVoted: false,
                    votedAt: null
                });
            });
        }
        
        // Save to localStorage
        saveElection(electionData);
        
        // Generate QR codes if needed
        if (electionData.voterAccess.type === 'restricted' && electionData.voterAccess.generateQrCodes) {
            // In a real application, we would generate QR codes here
            // For this demo, we'll just show a message
            showMessage(`Election created successfully! ${electionData.voterAccess.authorizedVoters.length} QR codes are ready for download.`, 'success');
            
            // Create a downloadable file with voter tokens
            createVoterTokensFile(electionData);
        } else {
            showMessage('Election created successfully!', 'success');
        }
        
        // Reset form after 2 seconds
        setTimeout(() => {
            electionForm.reset();
            
            // Reset candidate fields to just one
            candidatesContainer.innerHTML = `
                <div class="candidate-item">
                    <div class="form-group">
                        <input type="text" name="candidateName[]" placeholder="Candidate name" required>
                    </div>
                    <div class="form-group">
                        <input type="text" name="candidateParty[]" placeholder="Party/Affiliation (optional)">
                    </div>
                    <button type="button" class="remove-candidate" disabled><i class="fas fa-trash-alt"></i> Remove</button>
                </div>
            `;
            
            // Reset date inputs
            const newTomorrow = new Date();
            newTomorrow.setDate(newTomorrow.getDate() + 1);
            const newNextWeek = new Date(newTomorrow);
            newNextWeek.setDate(newNextWeek.getDate() + 7);
            
            startDateInput.value = formatDateForInput(newTomorrow);
            endDateInput.value = formatDateForInput(newNextWeek);
            
            // Reset voter access section
            restrictedVotersSection.style.display = 'none';
            voterAccessType.value = 'open';
            votersList.value = '';
            if (votersFile) votersFile.value = '';
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        }, 2000);
    });
    
    // Create a downloadable file with voter tokens
    function createVoterTokensFile(electionData) {
        // In a real application, we would generate a CSV or PDF file with QR codes
        // For this demo, we'll create a simple text file with voter IDs and tokens
        
        let content = 'Voter ID,Token,QR Code URL\n';
        electionData.voterAccess.authorizedVoters.forEach(voter => {
            // In a real app, this would be a URL to a QR code image
            const qrCodeUrl = `https://e-voting.com/vote?election=${electionData.id}&token=${voter.token}`;
            content += `${voter.id},${voter.token},${qrCodeUrl}\n`;
        });
        
        // Create a blob and download link
        const blob = new Blob([content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `voter-tokens-${electionData.id}.csv`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
    
    // Generate a unique token for voter QR codes
    function generateVoterToken() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }
    
    // Cancel button redirects to dashboard
    cancelBtn.addEventListener('click', function() {
        window.location.href = 'dashboard.html';
    });
    
    // Helper function to format date for datetime-local input
    function formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    // Helper function to generate unique ID
    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    // Helper function to save election to localStorage
    function saveElection(electionData) {
        // Get existing elections or initialize empty array
        let elections = JSON.parse(localStorage.getItem('elections')) || [];
        
        // Add new election
        elections.push(electionData);
        
        // Save back to localStorage
        localStorage.setItem('elections', JSON.stringify(elections));
    }
    
    // Helper function to show messages
    function showMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = 'election-form-message ' + type;
        formMessage.style.display = 'block';
        
        // Scroll to message
        formMessage.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Initialize event listeners for existing remove buttons
    document.querySelectorAll('.remove-candidate').forEach(button => {
        button.addEventListener('click', function() {
            if (!button.disabled) {
                button.closest('.candidate-item').remove();
                updateRemoveButtons();
            }
        });
    });
    
    // Update remove buttons on page load
    updateRemoveButtons();
}); 