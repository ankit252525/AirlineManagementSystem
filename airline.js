document.addEventListener('DOMContentLoaded', () => {
    const errorMessage = document.getElementById('error-message');
    let isAuthenticated = false;
    let currentUser = {};

    const signInForm = document.getElementById('sign-in-form');
    const signUpForm = document.getElementById('sign-up-form');
    const signInLink = document.getElementById('sign-in');
    const signUpLink = document.getElementById('sign-up');
    const profileSection = document.getElementById('profile-section');
    const profileIcon = document.getElementById('profile-icon');
    const checkInBtn = document.getElementById('check-in-btn');
    const flightStatusBtn = document.getElementById('check-flight-status-btn');
    const popularDestinations = document.getElementById('popular-destinations');
    const flightForm = document.getElementById('flight-form');
    const availableFlightsSection = document.getElementById('available-flights');
    const paymentSection = document.getElementById('payment-section');
    const confirmationSection = document.getElementById('confirmation-section');
    const checkInForm = document.getElementById('check-in-form');
    const flightStatusSection = document.getElementById('flight-status-section');
    const welcomeMessage = document.getElementById('welcome-message');
    const authForms = document.getElementById('auth-forms');


    const validRoutes = [
        { source: 'Patna', destination: 'Delhi' },
        { source: 'Delhi', destination: 'Patna' },
        { source: 'Mumbai', destination: 'Bangalore' },
        { source: 'Bangalore', destination: 'Mumbai' },
        { source: 'Kolkata', destination: 'Chennai' },
        { source: 'Chennai', destination: 'Kolkata' }
    ];

    function toggleAuthSection() {
        if (isAuthenticated) {
            signInLink.style.display = 'none';
            signUpLink.style.display = 'none';
            profileSection.style.display = 'block';
            flightForm.style.display = 'block';
            checkInBtn.style.display = 'block';
            flightStatusBtn.style.display = 'block';
            popularDestinations.style.display = 'none';
        } else {
            signInLink.style.display = 'block';
            signUpLink.style.display = 'block';
            profileSection.style.display = 'none';
            flightForm.style.display = 'none';
            checkInBtn.style.display = 'none';
            flightStatusBtn.style.display = 'none';
            popularDestinations.style.display = 'block';
        }
    }

    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
        isAuthenticated = false; // Reset authentication
        currentUser = {}; // Clear current user
        alert('You have been logged out!');
        toggleAuthSection(); // Update UI
    });

    document.addEventListener('click', function (event) {
        if (event.target && event.target.classList.contains('book-now-btn')) {
            if (!isAuthenticated) {
                alert('🚫 Access denied! Please sign in first.');
                return} else {
                    alert('Booking functionality is under construction.');
                }
        }
    });


    signInLink.addEventListener('click', (e) => {
        e.preventDefault();
        signInForm.style.display = 'block';
        signUpForm.style.display = 'none';
        flightForm.style.display = 'none';
        checkInForm.style.display = 'none';
        flightStatusSection.style.display = 'none';
        availableFlightsSection.style.display = 'none';
        paymentSection.style.display = 'none';
        confirmationSection.style.display = 'none';
        popularDestinations.style.display = 'none';
    });

    signUpLink.addEventListener('click', (e) => {
        e.preventDefault();
        signUpForm.style.display = 'block';
        signInForm.style.display = 'none';
        flightForm.style.display = 'none';
        checkInForm.style.display = 'none';
        flightStatusSection.style.display = 'none';
        availableFlightsSection.style.display = 'none';
        paymentSection.style.display = 'none';
        confirmationSection.style.display = 'none';
        popularDestinations.style.display = 'none';
    });

    signInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (response.ok) {
                isAuthenticated = true;
                currentUser = { ...data.user, password };
                welcomeMessage.textContent = `Welcome, ${currentUser.username}`;
                signInForm.style.display = 'none';
                toggleAuthSection();
            } else {
                errorMessage.textContent = data.error || 'Login failed. Please try again.';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error during login:', error);
            errorMessage.textContent = 'An error occurred. Please try again later.';
            errorMessage.style.display = 'block';
        }
    });
    signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('name').value;
        const email = document.getElementById('signup-email').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;
        const pincode = document.getElementById('pincode').value;
        const password = document.getElementById('signup-password').value;

        try {
            const response = await fetch('http://localhost:3000/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, phone, address, pincode, password })
            });
            const data = await response.json();

            if (response.ok) {
                alert('User registered successfully. Please sign in.');
                signUpForm.style.display = 'none';
                signInForm.style.display = 'block';
            } else {
                errorMessage.textContent = data.error || 'Registration failed. Please try again.';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error during registration:', error);
            errorMessage.textContent = 'An error occurred. Please try again later.';
            errorMessage.style.display = 'block';
        }
    });

    flightForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            alert('Please sign in to book a flight.');
            return;
        }

        const source = document.getElementById('source').value;
        const destination = document.getElementById('destination').value;
        const departuredate = document.getElementById('departure-date').value;
        const price = 2500;

        const isValidRoute = validRoutes.some(route =>
            route.source.toLowerCase() === source.toLowerCase().trim() &&
            route.destination.toLowerCase() === destination.toLowerCase().trim()
        );

        if (!isValidRoute) {
            errorMessage.textContent = 'No flights available on this route.';
            errorMessage.style.display = 'block';
            return;
        }

        fetch('http://localhost:3000/book-ticket', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: currentUser.email,
                password: currentUser.password,
                flightDetails: { source, destination, departuredate, price }
            })
        })
        .then(response => response.json().then(data => ({ status: response.status, ok: response.ok, body: data })))
        .then(({ ok, body }) => {
            if (ok) {
    
                const availableFlights = [
                    { flightNumber: 'AA101', airline: 'Alaska Airlines', time: '10:00 AM', price: '₹1800' },
                    { flightNumber: 'AA102', airline: 'Alaska Airlines', time: '12:00 PM', price: '₹2500' },
                    { flightNumber: 'AA103', airline: 'Alaska Airlines', time: '02:00 PM', price: '₹2400' },
                    { flightNumber: 'AA104', airline: 'Alaska Airlines', time: '04:00 PM', price: '₹3200' },
                    { flightNumber: 'AA105', airline: 'Alaska Airlines Premium', time: '06:00 PM', price: '₹4500' }
                ];

                const flightsList = document.getElementById('flights-list');
                flightsList.innerHTML = '';
                availableFlights.forEach(flight => {
                    const li = document.createElement('li');
                    li.textContent = `${flight.airline} - Flight ${flight.flightNumber} at ${flight.time} - ${flight.price}`;
                    li.dataset.flightNumber = flight.flightNumber;
                    li.classList.add('flight-item');
                    li.addEventListener('click', () => selectFlight(flight.flightNumber));
                    flightsList.appendChild(li);
                });

                availableFlightsSection.style.display = 'block';
                paymentSection.style.display = 'block';

                const paymentForm = document.getElementById('payment-form');
                paymentForm.dataset.selectedFlight = availableFlights[0].flightNumber;

                if (typeof body.pdf === 'string' && body.pdf.trim() !== '') {
                    const downloadLink = document.createElement('a');
                    downloadLink.href = `http://localhost:3000/tickets/${body.pdf.split('/').pop()}`;
                    downloadLink.textContent = '⬇ Download Your Ticket (PDF)';
                    downloadLink.download = 'flight_ticket.pdf';
                    downloadLink.className = 'btn btn-charming';
                    downloadLink.style.marginTop = '15px';
                    document.getElementById('pdf-download-link').appendChild(downloadLink);
                }
            } else {
                errorMessage.textContent = body.message || 'Booking failed. Please try again.';
                errorMessage.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error booking ticket:', error);
            errorMessage.textContent = 'An error occurred. Please try again later.';
            errorMessage.style.display = 'block';
        });
    });

    function selectFlight(flightNumber) {
        availableFlightsSection.style.display = 'none';
        paymentSection.style.display = 'block';
        const paymentForm = document.getElementById('payment-form');
        paymentForm.dataset.selectedFlight = flightNumber;
        popularDestinations.style.display = 'none';
    }


    function launchConfetti() {
        const duration = 3 * 1000; // 3 seconds
        const end = Date.now() + duration;
    
        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 }, // Left side
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 }, // Right side
            });
    
            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        })();
    }


    document.getElementById('payment-form').addEventListener('submit', (e) => {
        e.preventDefault();
        paymentSection.style.display = 'none';
        confirmationSection.style.display = 'block';
        popularDestinations.style.display = 'none';
        
        launchConfetti();


    });

    checkInBtn.addEventListener('click', () => {
        checkInForm.style.display = 'block';
        flightForm.style.display = 'none';
        availableFlightsSection.style.display = 'none';
        paymentSection.style.display = 'none';
        confirmationSection.style.display = 'none';
        popularDestinations.style.display = 'none';
    });

    checkInForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Check-in successful. Document verified and luggage weight recorded.');
        checkInForm.style.display = 'none';
        flightForm.style.display = 'block';
        popularDestinations.style.display = 'block';
    });

    flightStatusBtn.addEventListener('click', () => {
        flightStatusSection.style.display = 'block';
        availableFlightsSection.style.display = 'none';
        checkInForm.style.display = 'none';
        paymentSection.style.display = 'none';
        confirmationSection.style.display = 'none';
        popularDestinations.style.display = 'none';
    });

    flightStatusSection.addEventListener('submit', (e) => {
        e.preventDefault();
        const flightNumber = document.getElementById('flight-number').value;
        alert(`Flight Status: Flight ${flightNumber} is on time and ready for boarding.`);
    });

    toggleAuthSection();
});
