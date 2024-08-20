
    function toggleDashboard() {
        let dashboard = document.querySelector(".dashboard");
        let nav = document.querySelector(".nav");
        console.log("Dashboard element:", dashboard);
        console.log("navigation bar:", nav);

        if (dashboard && nav) {
            dashboard.classList.toggle("hide-dashboard");
            nav.classList.toggle("add-nav"); // Toggle navigation bar visibility

            // Adjust the width of the navigation bar based on dashboard visibility
            if (dashboard.classList.contains("hide-dashboard")) {
                dashboard.style.width = "22%";
                dashboard.style.transform = "translateX(0)"; // Move dashboard back into view
            } else {
                nav.style.width = "100%"; // Adjust this width based on your layout
                dashboard.style.transform = "translateX(-100%)"; // Move dashboard off-screen
            }
        } else {
            console.error("Dashboard or navigation bar element not found.");
        }

        console.log("clicked");
    }


