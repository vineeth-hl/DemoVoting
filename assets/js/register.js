document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const registerMessage = document.getElementById('registerMessage');
    
    // Initialize users in localStorage if it doesn't exist
    if (!localStorage.getItem('users')) {
        // Create default admin account
        const defaultUsers = [
            {
                id: 'admin123',
                fullName: 'Admin User',
                email: 'admin@evoting.com',
                password: 'admin123', // In a real app, this would be hashed
                type: 'admin',
                registrationDate: new Date().toISOString(),
                verified: true
            },
            {
                id: 'voter123',
                fullName: 'Test Voter',
                email: 'voter@evoting.com',
                password: 'voter123', // In a real app, this would be hashed
                type: 'voter',
                voterType: 'student',
                registrationDate: new Date().toISOString(),
                verified: true
            }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
    
    // Initialize OTP storage if it doesn't exist
    if (!localStorage.getItem('otpStorage')) {
        localStorage.setItem('otpStorage', JSON.stringify({}));
    }
    
    // Generate CAPTCHA on page load
    generateCaptcha();
    
    // Refresh CAPTCHA when clicked
    document.getElementById('captchaRefresh').addEventListener('click', generateCaptcha);
    
    // Handle form submission
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const userId = document.getElementById('userId').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const voterType = document.getElementById('voterType').value;
        const agreeTerms = document.getElementById('termsAgreement').checked;
        const captchaInput = document.getElementById('captchaInput').value.trim();
        const captchaText = document.getElementById('captchaText').getAttribute('data-captcha');
        
        // Validate form
        if (!fullName || !email || !userId || !password || !confirmPassword || !voterType) {
            showMessage('Please fill in all fields', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }
        
        if (!agreeTerms) {
            showMessage('You must agree to the Terms of Service and Privacy Policy', 'error');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }
        
        // Password strength validation
        if (password.length < 6) {
            showMessage('Password must be at least 6 characters long', 'error');
            return;
        }
        
        // Validate CAPTCHA
        if (!captchaInput) {
            showMessage('Please enter the CAPTCHA code', 'error');
            return;
        }
        
        if (captchaInput !== captchaText) {
            showMessage('CAPTCHA verification failed. Please try again.', 'error');
            generateCaptcha();
            return;
        }
        
        // Check if user ID or email already exists
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some(user => user.id === userId)) {
            showMessage('User ID already exists. Please choose another.', 'error');
            return;
        }
        
        if (users.some(user => user.email === email)) {
            showMessage('Email already registered. Please use another email.', 'error');
            return;
        }
        
        // Create new user object
        const newUser = {
            id: userId,
            fullName: fullName,
            email: email,
            password: password, // In a real app, this would be hashed
            type: 'voter', // Default type for registration
            voterType: voterType,
            registrationDate: new Date().toISOString(),
            verified: true // User is verified immediately with CAPTCHA
        };
        
        // Add user to localStorage
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Show success message
        showMessage('Registration successful! Redirecting to login page...', 'success');
        
        // Redirect to login page after a delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    });
    
    // Function to generate CAPTCHA
    function generateCaptcha() {
        const captchaText = document.getElementById('captchaText');
        const captchaInput = document.getElementById('captchaInput');
        
        // Generate random string for CAPTCHA
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let captcha = '';
        for (let i = 0; i < 6; i++) {
            captcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Store CAPTCHA text as data attribute
        captchaText.setAttribute('data-captcha', captcha);
        
        // Display CAPTCHA text
        captchaText.textContent = captcha;
        
        // Clear input field
        if (captchaInput) {
            captchaInput.value = '';
        }
    }
    
    // Function to show messages
    function showMessage(message, type) {
        registerMessage.textContent = message;
        registerMessage.className = 'register-message ' + type;
        registerMessage.style.display = 'block';
        
        // Hide message after 5 seconds
        setTimeout(() => {
            registerMessage.style.display = 'none';
        }, 5000);
    }
    
    // Toggle password visibility
    const togglePassword = document.getElementById('passwordToggle');
    const toggleConfirmPassword = document.getElementById('confirmPasswordToggle');
    
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const passwordInput = document.getElementById('password');
            togglePasswordVisibility(passwordInput, togglePassword);
        });
    }
    
    if (toggleConfirmPassword) {
        toggleConfirmPassword.addEventListener('click', () => {
            const confirmPasswordInput = document.getElementById('confirmPassword');
            togglePasswordVisibility(confirmPasswordInput, toggleConfirmPassword);
        });
    }
    
    function togglePasswordVisibility(input, icon) {
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
}); 