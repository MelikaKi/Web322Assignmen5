require('dotenv').config();
require('pg');
const { Sequelize, Op } = require('sequelize');

const sequelize = new Sequelize(
    process.env.PGDATABASE,
    process.env.PGUSER,
    process.env.PGPASSWORD,
    {
        host: process.env.PGHOST,
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false,
    }
);

const Sector = sequelize.define('Sector', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sector_name: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, { timestamps: false });

const Project = sequelize.define('Project', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    feature_img_url: {
        type: Sequelize.STRING,
        allowNull: false
    },
    summary_short: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    intro_short: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    impact: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    original_source_url: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, { timestamps: false });

Project.belongsTo(Sector, { foreignKey: 'sector_id' });

function initialize() {
    return sequelize.sync()
        .then(() => console.log("Database synchronized successfully."))
        .catch(err => Promise.reject("Failed to initialize database: " + err.message));
}

function getAllProjects() {
    return new Promise((resolve, reject) => {
        Project.findAll({ include: [Sector] })
            .then(data => resolve(data))
            .catch(() => reject("Unable to retrieve projects"));
    });
}

function getProjectById(projectId) {
    return new Promise((resolve, reject) => {
        Project.findAll({
            include: [Sector],
            where: { id: projectId }
        })
        .then(data => {
            if (data.length > 0) resolve(data[0]); 
            else reject("Unable to find requested project");
        })
        .catch(() => reject("Error retrieving project"));
    });
}

function getProjectsBySector(sector) {
    return Project.findAll({
        include: [Sector],
        where: { '$Sector.sector_name$': { [Op.iLike]: `%${sector}%` } }
    });
}

function addProject(projectData) {
    return new Promise((resolve, reject) => {
        Project.create(projectData)
            .then(() => resolve())
            .catch(err => reject(err.errors[0].message));
    });
}

function getAllSectors() {
    return Sector.findAll()
        .then(data => data)
        .catch(() => Promise.reject("Unable to retrieve sectors"));
}

function editProject(id, projectData) {
    return new Promise((resolve, reject) => {
        Project.update(projectData, { where: { id } })
            .then(result => {
                if (result[0] > 0) {
                    resolve();
                } else {
                    reject("Project not found or not updated");
                }
            })
            .catch(err => reject(err.errors[0].message));
    });
}

function deleteProject(id) {
    return new Promise((resolve, reject) => {
        Project.destroy({ where: { id } })
            .then(result => {
                if (result > 0) {
                    resolve();
                } else {
                    reject("Project not found or already deleted");
                }
            })
            .catch(err => reject(err.errors ? err.errors[0].message : "Error deleting project"));
    });
}

module.exports = { 
    initialize, 
    getAllProjects, 
    getProjectById, 
    getProjectsBySector, 
    addProject, 
    getAllSectors, 
    editProject, 
    deleteProject 
};
