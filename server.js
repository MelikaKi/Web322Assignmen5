/********************************************************************************
*  WEB322 – Assignment 5
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Melika Kazemi
*  Student ID: 166429233
*  Date: 2025-03-06
*
*  Published URL: 
*
********************************************************************************/

const express = require("express");
const path = require("path");
const projectData = require("./modules/projects");

const app = express();

const studentName = "Melika Kazemi";
const studentId = "166429233";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date() });
});

// Home Page
app.get("/", (req, res) => {
    projectData.getAllProjects()
        .then(projects => {
            res.render("home", { 
                page: "/", 
                projects, 
                studentName, 
                studentId,
                timestamp: new Date()
            });
        })
        .catch(err => {
            res.status(500).render("500", {
                message: `Error loading projects: ${err}`,
                studentName,
                studentId,
                timestamp: new Date()
            });
        });
});

// About Page
app.get("/about", (req, res) => {
    res.render("about", { page: "/about", studentName, studentId, timestamp: new Date() });
});

// Display All Projects or Filter by Sector
app.get("/solutions/projects", (req, res) => {
    const { sector } = req.query;
    if (sector) {
        projectData.getProjectsBySector(sector)
            .then(projects => {
                res.render("projects", { 
                    projects, 
                    page: "/solutions/projects", 
                    studentName, 
                    studentId, 
                    timestamp: new Date() 
                });
            })
            .catch(() => {
                res.status(404).render("404", {
                    message: `No projects found for sector: ${sector}`,
                    studentName,
                    studentId,
                    timestamp: new Date()
                });
            });
    } else {
        projectData.getAllProjects()
            .then(projects => {
                res.render("projects", { 
                    projects, 
                    page: "/solutions/projects", 
                    studentName, 
                    studentId, 
                    timestamp: new Date() 
                });
            })
            .catch(() => {
                res.status(500).render("500", {
                    message: "Unable to load projects",
                    studentName,
                    studentId,
                    timestamp: new Date()
                });
            });
    }
});

// Display Single Project by ID
app.get("/solutions/projects/:id", (req, res) => {
    const projectId = parseInt(req.params.id, 10);
    if (isNaN(projectId)) {
        return res.status(404).render("404", { 
            message: "Invalid project ID", 
            studentName, 
            studentId,
            timestamp: new Date() 
        });
    }

    projectData.getProjectById(projectId)
        .then(project => {
            res.render("project", { 
                project, 
                studentName, 
                studentId, 
                timestamp: new Date() 
            });
        })
        .catch(() => {
            res.status(404).render("404", { 
                message: "Error retrieving project", 
                studentName, 
                studentId, 
                timestamp: new Date() 
            });
        });
});

// Display Add Project Form
app.get("/solutions/addProject", (req, res) => {
    projectData.getAllSectors()
        .then(sectors => {
            res.render("addProject", { 
                sectors, 
                studentName, 
                studentId, 
                timestamp: new Date() 
            });
        })
        .catch(err => {
            res.status(500).render("500", { 
                message: `Error loading sectors: ${err}`,
                studentName, 
                studentId, 
                timestamp: new Date() 
            });
        });
});

// Handle New Project Submission
app.post("/solutions/addProject", (req, res) => {
    projectData.addProject(req.body)
        .then(() => res.redirect("/solutions/projects"))
        .catch(err => {
            res.status(500).render("500", { 
                message: `Error: ${err}`,
                studentName, 
                studentId, 
                timestamp: new Date() 
            });
        });
});

// Display Edit Project Form
app.get("/solutions/editProject/:id", (req, res) => {
    const projectId = parseInt(req.params.id, 10);
    if (isNaN(projectId)) {
        return res.status(404).render("404", { 
            message: "Invalid project ID", 
            studentName, 
            studentId, 
            timestamp: new Date() 
        });
    }

    Promise.all([projectData.getProjectById(projectId), projectData.getAllSectors()])
        .then(([project, sectors]) => {
            res.render("editProject", { 
                project, 
                sectors, 
                studentName, 
                studentId, 
                timestamp: new Date() 
            });
        })
        .catch(err => {
            res.status(404).render("404", { 
                message: err,
                studentName, 
                studentId, 
                timestamp: new Date() 
            });
        });
});

// Handle Edit Project Submission
app.post("/solutions/editProject", (req, res) => {
    const projectId = req.body.id;

    projectData.editProject(projectId, req.body)
        .then(() => res.redirect("/solutions/projects"))
        .catch(err => {
            res.status(500).render("500", { 
                message: `Error: ${err}`,
                studentName, 
                studentId, 
                timestamp: new Date() 
            });
        });
});

// Handle Project Deletion
app.get("/solutions/deleteProject/:id", (req, res) => {
    const projectId = parseInt(req.params.id, 10);
    if (isNaN(projectId)) {
        return res.status(404).render("404", { 
            message: "Invalid project ID", 
            studentName, 
            studentId, 
            timestamp: new Date() 
        });
    }

    projectData.deleteProject(projectId)
        .then(() => res.redirect("/solutions/projects"))
        .catch(err => {
            res.status(500).render("500", { 
                message: `Error: ${err}`,
                studentName, 
                studentId, 
                timestamp: new Date() 
            });
        });
});

// 404 Page Handler
app.use((req, res) => {
    res.status(404).render("404", { 
        message: "Page not found.", 
        studentName, 
        studentId, 
        timestamp: new Date() 
    });
});

// Initialize Database and Start Server
projectData.initialize()
    .then(() => {
        console.log("Project data initialized successfully.");
        const PORT = process.env.PORT || 5001;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error(`Failed to initialize project data: ${err}`);
        process.exit(1);
    });

module.exports = app;