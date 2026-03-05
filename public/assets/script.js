// Add event listeners only if elements exist
document.addEventListener("DOMContentLoaded", function() {
    // Initialize page loading progress bar
    const progressBar = document.getElementById("progressBar");
    if (progressBar) {
        // Simulate page loading progress
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 100) {
                clearInterval(interval);
            } else {
                width += 10;
                progressBar.style.width = width + "%";
                if (width >= 100) {
                    setTimeout(() => {
                        progressBar.style.opacity = "0";
                    }, 200);
                }
            }
        }, 100);
    }
    
    // Add fade-in animations to elements
    const addFadeInEffects = () => {
        const elements = [
            document.querySelector(".timing-base-greeting"),
            document.querySelector(".form-group:nth-of-type(1)"),
            document.querySelector(".form-group:nth-of-type(2)"),
            document.querySelector(".form-check"),
            document.querySelector(".submitsignbtn")
        ];
        
        elements.forEach((element, index) => {
            if (element) {
                element.classList.add("fade-in");
                element.classList.add(`delay-${(index + 1) * 100}`);
            }
        });
    };
    
    addFadeInEffects();
    
    // Login form submission handler
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault(); // Stop form submission
            
            const email = document.getElementById("exampleInputEmail1").value.trim();
            const password = document.getElementById("exampleInputPassword1").value.trim();

            if (!email || !password) {
                alert("Both username and password are required.");
                return;
            }
            
            // Add pulse animation to login button
            const loginButton = document.querySelector(".logon-btn");
            if (loginButton) {
                loginButton.classList.add("pulse");
            }
            
            // Show loading spinner
            const loadingSpinner = document.getElementById("loadingSpinner");
            if (loadingSpinner) {
                loadingSpinner.classList.add("active");
            }

            // Real login request
            fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password: password })
            })
            .then(async response => {
                const data = await response.json();
                if (loadingSpinner) loadingSpinner.classList.remove("active");
                if (loginButton) loginButton.classList.remove("pulse");

                if (response.ok) {
                    // Success - store user data and proceed to modal
                    sessionStorage.setItem("user", JSON.stringify(data.user));
                    sessionStorage.setItem("loginTime", new Date().toLocaleString());
                    sessionStorage.setItem("userIp", data.ip);
                    
                    const modal = document.getElementById('exampleModal');
                    if (modal && typeof bootstrap !== 'undefined') {
                        const bsModal = new bootstrap.Modal(modal);
                        bsModal.show();
                    } else {
                        window.location.href = "profile.html";
                    }
                } else {
                    alert(data.message || "Login failed");
                }
            })
            .catch(err => {
                console.error("Login error:", err);
                if (loadingSpinner) loadingSpinner.classList.remove("active");
                if (loginButton) loginButton.classList.remove("pulse");
                alert("An error occurred during login");
            });
        });
    }

    // Add subtle hover interactions to navigation items
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });
    
    // Add hover effect to account options
    const accountOptions = document.querySelectorAll('.acont-drop');
    accountOptions.forEach(option => {
        option.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.2s ease';
            this.style.color = '#d71e28';
            this.style.cursor = 'pointer';
        });
        
        option.addEventListener('mouseleave', function() {
            this.style.transition = 'all 0.2s ease';
            this.style.color = '';
        });
    });
    
    // Function to determine the greeting
    function getGreetingBasedOnTime() {
        const now = new Date();
        const hour = now.getHours();

        if (hour >= 5 && hour < 12) {
            return "Good Morning";
        } else if (hour >= 12 && hour < 17) {
            return "Good Afternoon";
        } else if (hour >= 17 && hour < 21) {
            return "Good Evening";
        } else {
            return "Good Night";
        }
    }

    // Set the greeting on page load
    const greetingText = document.getElementById("greetingText");
    const userDisplay = document.querySelector(".nav-link .bi-person-circle")?.parentElement;
    
    // Load user data from session
    const userData = JSON.parse(sessionStorage.getItem("user") || "{}");
    
    if (greetingText) {
        greetingText.textContent = getGreetingBasedOnTime();
    }

    // Fetch dynamic content
    async function fetchDynamicContent(key, elementId, defaultValue) {
        try {
            const response = await fetch(`/api/content/${key}`);
            if (response.ok) {
                const data = await response.json();
                const element = document.getElementById(elementId);
                if (element && data.content) {
                    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                        element.value = data.content.value;
                    } else {
                        element.textContent = data.content.value;
                    }
                }
            } else if (defaultValue) {
                const element = document.getElementById(elementId);
                if (element) element.textContent = defaultValue;
            }
        } catch (error) {
            console.error(`Error fetching content for ${key}:`, error);
            if (defaultValue) {
                const element = document.getElementById(elementId);
                if (element) element.textContent = defaultValue;
            }
        }
    }

    // Fetch homepage content if on index
    if (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html')) {
        fetchDynamicContent('homepage_heading', 'main-heading', 'Welcome to Wells Fargo');
        fetchDynamicContent('homepage_subtext', 'sub-heading', 'Experience secure and convenient banking at your fingertips.');
    }
    
    // Fetch footer content
    fetchDynamicContent('footer_contact', 'footer-contact-info', 'Contact us: 1-800-WELLS-FARGO');
    
    if (userDisplay && userData.firstName) {
        userDisplay.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                    fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16">
                                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                                    <path fill-rule="evenodd"
                                        d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
                                </svg> Welcome, ${userData.firstName.toUpperCase()} <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                    fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd"
                                        d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
                                </svg>`;
    }

    // Update profile page details
    const profileName = document.querySelector("#personal .fw-bold");
    if (profileName && userData.firstName) {
        profileName.textContent = `${userData.firstName.toUpperCase()} ${userData.lastName?.toUpperCase() || ''}`;
        
        // Update other fields if they exist in userData
        const fields = {
            "Date of Birth": userData.dateOfBirth,
            "Social Security Number": userData.socialSecurityNumber,
            "Home Address": userData.address,
            "EMAIL ADDRESS FOR LEGAL NOTICES": userData.email,
            "TEMP EMAIL ADDRESS": userData.temporaryEmail
        };
        
        document.querySelectorAll(".row.mb-3, .row").forEach(row => {
            const label = row.querySelector(".text-muted")?.textContent;
            const value = row.querySelector(".fw-bold");
            if (label && fields[label] && value) {
                value.textContent = fields[label];
            }
        });
    }

    // Update balance and accounts
    fetch('/api/accounts')
        .then(res => res.json())
        .then(data => {
            if (data.accounts && data.accounts.length > 0) {
                const totalBalance = data.accounts.reduce((sum, acc) => sum + parseFloat(acc.balance.replace(/[^0-9.-]+/g,"")), 0);
                const balanceDisplays = document.querySelectorAll(".available-bal h4:last-child, .balance h4");
                balanceDisplays.forEach(el => {
                    el.textContent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalBalance);
                });
                
                // Update specific account card
                const mainAccount = data.accounts[0];
                const accountName = document.querySelector(".dale-name-crd h4");
                const accountNumber = document.querySelector(".dale-name-crd small");
                const accountBalance = document.querySelector(".dale-acont-card .balance h4");
                
                if (accountName) accountName.textContent = mainAccount.accountType;
                if (accountNumber) accountNumber.textContent = `xxxx${mainAccount.accountNumber.slice(-4)}`;
                if (accountBalance) accountBalance.textContent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(mainAccount.balance);
            }
        });

    // Show login time
    const loginTime = sessionStorage.getItem("loginTime") || "Not available";
    const userIp = sessionStorage.getItem("userIp") || "Not available";

    const detailsDiv = document.querySelector(".clnt-details");
    if (detailsDiv) {
        detailsDiv.innerHTML = `
        <strong>Login time:</strong> ${loginTime}<br>
        <strong>Your IP Address:</strong> ${userIp}
        `;
        
        // Add fade-in animations to account cards
        const accountCards = document.querySelectorAll('.aconct-card-bg-white');
        accountCards.forEach((card, index) => {
            // Add shimmer effect initially
            card.classList.add('shimmer');
            
            // After a short delay, remove shimmer and add fade-in
            setTimeout(() => {
                card.classList.remove('shimmer');
                card.classList.add('fade-in');
                card.classList.add(`delay-${(index + 1) * 100}`);
            }, 1000);
        });
        
        // Hide the loading spinner if it's showing
        const loadingSpinner = document.getElementById("loadingSpinner");
        if (loadingSpinner && loadingSpinner.classList.contains('active')) {
            setTimeout(() => {
                loadingSpinner.classList.remove('active');
            }, 500);
        }
        
        // Initialize and then hide progress bar
        const progressBar = document.getElementById("progressBar");
        if (progressBar) {
            progressBar.style.width = "100%";
            setTimeout(() => {
                progressBar.style.opacity = "0";
            }, 500);
        }
    }

    // Attach this to modal Proceed button on login page
    const proceedButton = document.querySelector(".proceeed-butoon");
    if (proceedButton) {
        proceedButton.addEventListener("click", () => {
            const checkbox = document.getElementById("modalAcceptCheck");
            const warning = document.getElementById("acceptWarning");

            if (!checkbox.checked) {
                warning.style.display = "block";
                return; // Stop here if checkbox is not checked
            } else {
                warning.style.display = "none";
            }
            
            window.location.href = "profile.html";
        });
    }

    async function logout() {
        try {
            const res = await fetch('/api/logout', { method: 'POST' });
            const data = await res.json();
            if (data.signOffTime) {
                sessionStorage.setItem("signOffTime", data.signOffTime);
            } else {
                sessionStorage.setItem("signOffTime", new Date().toLocaleString());
            }
            window.location.href = '/signout.html';
        } catch (err) {
            console.error("Logout error:", err);
            window.location.href = '/signout.html';
        }
    }

    // Attach logout to sign out links
    const signOutLinks = document.querySelectorAll('a[href="signout.html"], .sign-out-btn');
    signOutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    });
});