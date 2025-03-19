// Dashboard JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (!currentUser) {
        // Redirect to login page if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    // Update user name in the header
    const userNameElement = document.getElementById('userName');
    if (userNameElement && currentUser.fullName) {
        userNameElement.textContent = currentUser.fullName;
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Clear session storage
            sessionStorage.removeItem('currentUser');
            
            // Redirect to home page
            window.location.href = 'index.html';
        });
    }
    
    // Initialize elections data in localStorage if it doesn't exist
    if (!localStorage.getItem('elections')) {
        const defaultElections = [
            {
                id: 'election1',
                title: 'Student Council Election',
                description: 'Vote for your student representatives for the upcoming academic year.',
                startDate: '2023-05-15',
                endDate: '2023-05-20',
                status: 'active',
                eligibility: 'students',
                type: 'single',
                candidates: [
                    { id: 'c1', name: 'John Smith', position: 'President', votes: 78 },
                    { id: 'c2', name: 'Emily Davis', position: 'President', votes: 45 },
                    { id: 'c3', name: 'Michael Johnson', position: 'President', votes: 22 }
                ],
                settings: {
                    anonymousVoting: true,
                    publicResults: true,
                    realTimeResults: false
                },
                voters: ['user1', 'user2', 'admin'],
                createdBy: 'admin',
                createdAt: '2023-05-01'
            },
            {
                id: 'election2',
                title: 'Community Board Election',
                description: 'Select members for the community development board.',
                startDate: '2023-06-10',
                endDate: '2023-06-15',
                status: 'active',
                eligibility: 'all',
                type: 'multiple',
                candidates: [
                    { id: 'c4', name: 'Sarah Wilson', position: 'Board Member', votes: 56 },
                    { id: 'c5', name: 'Robert Brown', position: 'Board Member', votes: 42 },
                    { id: 'c6', name: 'Jennifer Lee', position: 'Board Member', votes: 0 }
                ],
                settings: {
                    anonymousVoting: true,
                    publicResults: true,
                    realTimeResults: true
                },
                voters: ['user1'],
                createdBy: 'admin',
                createdAt: '2023-05-15'
            },
            {
                id: 'election3',
                title: 'Club President Election',
                description: 'Vote for the new president of the community club.',
                startDate: '2023-07-05',
                endDate: '2023-07-10',
                status: 'upcoming',
                eligibility: 'all',
                type: 'single',
                candidates: [
                    { id: 'c7', name: 'David Miller', position: 'President', votes: 0 },
                    { id: 'c8', name: 'Lisa Garcia', position: 'President', votes: 0 }
                ],
                settings: {
                    anonymousVoting: true,
                    publicResults: false,
                    realTimeResults: false
                },
                voters: [],
                createdBy: 'admin',
                createdAt: '2023-06-01'
            }
        ];
        localStorage.setItem('elections', JSON.stringify(defaultElections));
    }
    
    // Vote button functionality
    const voteButtons = document.querySelectorAll('.vote-btn');
    voteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const electionCard = e.target.closest('.election-card');
            const electionTitle = electionCard.querySelector('h3').textContent;
            
            // In a real application, this would redirect to a voting page
            // For now, we'll just show an alert
            alert(`You are about to vote in: ${electionTitle}`);
            
            // Simulate successful vote
            const statusElement = electionCard.querySelector('.vote-status');
            statusElement.innerHTML = '<i class="fas fa-check-circle"></i> You have voted';
            statusElement.classList.remove('not-voted');
            statusElement.classList.add('voted');
            
            // Replace vote button with view details button
            button.textContent = 'View Details';
            button.classList.remove('vote-btn');
            button.classList.add('view-btn');
        });
    });
    
    // View details button functionality
    const viewButtons = document.querySelectorAll('.view-btn, .details-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            let title;
            
            if (button.classList.contains('view-btn')) {
                title = e.target.closest('.election-card').querySelector('h3').textContent;
            } else {
                title = e.target.closest('.result-card').querySelector('h3').textContent;
            }
            
            // In a real application, this would redirect to a details page
            // For now, we'll just show an alert
            alert(`Viewing details for: ${title}`);
        });
    });
    
    // Create Election Form Functionality
    const createElectionForm = document.getElementById('createElectionForm');
    const addCandidateBtn = document.getElementById('addCandidateBtn');
    const candidatesList = document.getElementById('candidatesList');
    
    // Add candidate button functionality
    if (addCandidateBtn && candidatesList) {
        addCandidateBtn.addEventListener('click', () => {
            const candidateItem = document.createElement('div');
            candidateItem.className = 'candidate-item';
            candidateItem.innerHTML = `
                <div class="form-group">
                    <input type="text" class="candidate-name" placeholder="Candidate Name" required>
                </div>
                <div class="form-group">
                    <input type="text" class="candidate-position" placeholder="Position (optional)">
                </div>
                <button type="button" class="btn remove-candidate"><i class="fas fa-times"></i></button>
            `;
            
            candidatesList.appendChild(candidateItem);
            
            // Add event listener to remove button
            const removeBtn = candidateItem.querySelector('.remove-candidate');
            removeBtn.addEventListener('click', () => {
                candidateItem.remove();
            });
        });
        
        // Add event listener to initial remove button
        const initialRemoveBtn = document.querySelector('.remove-candidate');
        if (initialRemoveBtn) {
            initialRemoveBtn.addEventListener('click', (e) => {
                if (document.querySelectorAll('.candidate-item').length > 1) {
                    e.target.closest('.candidate-item').remove();
                } else {
                    alert('You must have at least one candidate.');
                }
            });
        }
    }
    
    // Create election form submission
    if (createElectionForm) {
        createElectionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form values
            const title = document.getElementById('electionTitle').value.trim();
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            const description = document.getElementById('electionDescription').value.trim();
            const eligibility = document.getElementById('eligibility').value;
            const electionType = document.getElementById('electionType').value;
            
            // Get candidates
            const candidateItems = document.querySelectorAll('.candidate-item');
            const candidates = [];
            
            candidateItems.forEach((item, index) => {
                const name = item.querySelector('.candidate-name').value.trim();
                const position = item.querySelector('.candidate-position').value.trim();
                
                if (name) {
                    candidates.push({
                        id: `c${Date.now()}-${index}`,
                        name,
                        position,
                        votes: 0
                    });
                }
            });
            
            // Get settings
            const anonymousVoting = document.getElementById('anonymousVoting').checked;
            const publicResults = document.getElementById('publicResults').checked;
            const realTimeResults = document.getElementById('realTimeResults').checked;
            
            // Validate dates
            const start = new Date(startDate);
            const end = new Date(endDate);
            const today = new Date();
            
            if (end <= start) {
                alert('End date must be after start date.');
                return;
            }
            
            // Determine status
            let status;
            if (start <= today && end >= today) {
                status = 'active';
            } else if (start > today) {
                status = 'upcoming';
            } else {
                status = 'completed';
            }
            
            // Create election object
            const newElection = {
                id: `election-${Date.now()}`,
                title,
                description,
                startDate,
                endDate,
                status,
                eligibility,
                type: electionType,
                candidates,
                settings: {
                    anonymousVoting,
                    publicResults,
                    realTimeResults
                },
                voters: [],
                createdBy: currentUser.id || currentUser.userId,
                createdAt: new Date().toISOString()
            };
            
            // Save to localStorage
            const elections = JSON.parse(localStorage.getItem('elections')) || [];
            elections.push(newElection);
            localStorage.setItem('elections', JSON.stringify(elections));
            
            // Show success message
            alert('Election created successfully!');
            
            // Reset form
            createElectionForm.reset();
            
            // Reload page to show new election
            window.location.reload();
        });
        
        // Cancel button functionality
        const cancelBtn = document.querySelector('.cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to cancel? All entered data will be lost.')) {
                    createElectionForm.reset();
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }
            });
        }
    }
    
    // Manage Elections Table Functionality
    const electionsTableBody = document.getElementById('electionsTableBody');
    
    if (electionsTableBody) {
        // Add event listeners to action buttons
        document.querySelectorAll('.view-results-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const electionTitle = e.target.closest('tr').querySelector('td:first-child').textContent;
                alert(`Viewing results for: ${electionTitle}`);
            });
        });
        
        document.querySelectorAll('.edit-election-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const electionTitle = e.target.closest('tr').querySelector('td:first-child').textContent;
                alert(`Editing election: ${electionTitle}`);
            });
        });
        
        document.querySelectorAll('.delete-election-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const electionTitle = e.target.closest('tr').querySelector('td:first-child').textContent;
                if (confirm(`Are you sure you want to delete the election: ${electionTitle}?`)) {
                    alert(`Election deleted: ${electionTitle}`);
                    e.target.closest('tr').remove();
                }
            });
        });
    }
    
    // Admin-specific functionality
    if (currentUser.type === 'admin' || currentUser.role === 'admin') {
        // Add admin controls
        const adminControls = document.createElement('div');
        adminControls.className = 'admin-controls';
        adminControls.innerHTML = `
            <div class="admin-header">
                <h3><i class="fas fa-user-shield"></i> Admin Controls</h3>
            </div>
            <div class="admin-actions">
                <button class="btn admin-btn" id="createElectionBtn"><i class="fas fa-plus-circle"></i> Create Election</button>
                <button class="btn admin-btn" id="manageUsersBtn"><i class="fas fa-users"></i> Manage Users</button>
                <button class="btn admin-btn" id="analyticsBtn"><i class="fas fa-chart-line"></i> Analytics</button>
            </div>
        `;
        
        // Insert admin controls after dashboard header
        const dashboardHeader = document.querySelector('.dashboard-header');
        if (dashboardHeader) {
            dashboardHeader.parentNode.insertBefore(adminControls, dashboardHeader.nextSibling);
        }
        
        // Add admin button event listeners
        document.getElementById('createElectionBtn')?.addEventListener('click', () => {
            // Scroll to create election section
            const createElectionSection = document.getElementById('create-election');
            if (createElectionSection) {
                window.scrollTo({
                    top: createElectionSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
        
        document.getElementById('manageUsersBtn')?.addEventListener('click', () => {
            showUserManagement();
        });
        
        document.getElementById('analyticsBtn')?.addEventListener('click', () => {
            alert('Analytics functionality will be implemented in a future update.');
        });
    }
    
    // Function to show user management interface
    function showUserManagement() {
        // Create user management container
        const userManagement = document.createElement('div');
        userManagement.className = 'user-management';
        userManagement.innerHTML = `
            <h3><i class="fas fa-users"></i> User Management</h3>
            <div class="user-table-container">
                <table class="user-table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Type</th>
                            <th>Registration Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="userTableBody">
                        <!-- User data will be inserted here -->
                    </tbody>
                </table>
            </div>
        `;
        
        // Insert user management after admin controls
        const adminControls = document.querySelector('.admin-controls');
        if (adminControls) {
            adminControls.parentNode.insertBefore(userManagement, adminControls.nextSibling);
        }
        
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Populate user table
        const userTableBody = document.getElementById('userTableBody');
        if (userTableBody) {
            users.forEach(user => {
                const tr = document.createElement('tr');
                
                // Format registration date
                const regDate = user.registrationDate ? new Date(user.registrationDate).toLocaleDateString() : 'N/A';
                
                tr.innerHTML = `
                    <td>${user.id || user.userId}</td>
                    <td>${user.fullName}</td>
                    <td>${user.email}</td>
                    <td>${user.type || user.role || 'voter'}</td>
                    <td>${regDate}</td>
                    <td class="user-actions">
                        <button class="edit-btn">Edit</button>
                        <button class="delete-btn">Delete</button>
                    </td>
                `;
                
                userTableBody.appendChild(tr);
            });
            
            // Add event listeners to action buttons
            userTableBody.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const userId = e.target.closest('tr').querySelector('td:first-child').textContent;
                    alert(`Editing user: ${userId}`);
                });
            });
            
            userTableBody.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const userId = e.target.closest('tr').querySelector('td:first-child').textContent;
                    if (confirm(`Are you sure you want to delete user: ${userId}?`)) {
                        alert(`User deleted: ${userId}`);
                        e.target.closest('tr').remove();
                    }
                });
            });
        }
    }
}); 