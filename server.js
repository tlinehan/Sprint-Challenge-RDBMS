const express = require('express');

const db = require('./data/db');

const server = express();
server.use(express.json());

const port = 3333;


//HOME
server.get('/', (req, res) => {
    res.send('Rock-n-Roll!!');
});

//POST CREATE NEW PROJECT
server.post('/api/projects', (req, res) => {
    const { name, description, completed } = req.body;
    const newProject = { name, description, completed };
    if (!name) {
        res.status(400).json({'ERROR!!! dataShape': {
            name: 'REQUIRED & UNIQUE',
            description: 'string', 
            completed: 'BOOLEAN, DEFAULT SET TO FALSE BY SERVER'
            } 
        });
        return; 
    };
    db('projects').insert(newProject).then(response => {
        res.status(201).json({id: `${response}`});
    }).catch(err => {
        console.log(err);
        res.status(500).json({error: 'Did not save to server!', err});
    });
});
//GET PROJECTS
server.get('/api/projects', (req, res) => {
    db('projects').then(projects => {
        res.status(200).json({projects});
    });
});

//GET PROJECT BY ID, WITH ACTIONS
server.get('/api/projects/:id', async (req, res) => {
    const { id } = req.params;
    //let response ;
    const projectPromise = db('projects').where('id', '=', id);
    const actionsPromise = db('actions').where('project_id', '=', id);
    // const dataBundle = await Promise.all([projectPromise, actionsPromise])
    // const [project, actions] = dataBundle;
    // const response = {project, actions}
    // res.status(200).json(response);  
    const [[project], actions] = await Promise.all([projectPromise, actionsPromise]);
    const response = {...project, actions};    
    res.status(200).json(response);
});

//DELETE PROJECT
server.delete('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    db('projects').where({id: id}).del().then(response => {
        //console.log(response);
        if (response === 0) {
            res.status(404).json({ERROR: 'ID Not found'});
            console.log('FAIL, ID Not found');
            return;
        } else if (response === 1) {
            res.status(200).json({successfulDelete: `id: ${id}`});
            console.log('SUCCESS');
        };
    }).catch(err => {
        console.log(err);
        res.status(500).json({serverError: 'FAIL'});
        res.end();
    });
});

//PUT EDIT PROJECT
server.put('/api/projects/:id', (req, res) => {
    const {id} = req.params;
    const {name, description, completed} = req.body;
    if(!name && !description && !completed) {
        res.status(400).json({error: 'bad request from user'});
        return;
    };
    db('projects').where({id: id}).update({name, description, completed}).then(response => {
        if (response === 0) {
            res.status(404).json({error: 'ID not found'});
            return;
        } else if (response === 1) {
            res.status(200).json(['success']);
        };
    }).catch(err => {
        res.status(500).json(err);
    });
});

//POST CREATE NEW ACTION
server.post('/api/actions', (req, res) => {
    const { project_id, description, notes, completed } = req.body;
    const newAction = { project_id, description, notes, completed };
    if (!project_id || !description) {
        res.status(400).json({'ERROR!!! dataShape': {
            project_id: 'REQUIRED',
            description: 'REQUIRED', 
            notes: 'string',
            completed: 'BOOLEAN, DEFAULT SET TO FALSE BY SERVER'
            } 
        });
        return; 
    };
    db('actions').insert(newAction).then(response => {
        res.status(201).json({id: `${response}`});
    }).catch(err => {
        console.log(err);
        res.status(500).json({error: 'Did not save to server!', err});
    });
});
//GET ACTIONS
server.get('/api/actions', (req, res) => {
    db('actions').then(actions => {
        res.status(200).json({actions});
    });
});

//DELETE actions
server.delete('/api/actions/:id', (req, res) => {
    const { id } = req.params;
    db('actions').where({id: id}).del().then(response => {
        //console.log(response);
        if (response === 0) {
            res.status(404).json({ERROR: 'ID Not found'});
            console.log('FAIL, ID Not found');
            return;
        } else if (response === 1) {
            res.status(200).json({successfulDelete: `id: ${id}`});
            console.log('SUCCESS');
        };
    }).catch(err => {
        console.log(err);
        res.status(500).json({serverError: 'FAIL'});
        res.end();
    });
});

//PUT EDIT ACTIONS
server.put('/api/actions/:id', (req, res) => {
    const {id} = req.params;
    const {project_id, description, notes, completed} = req.body;
    if(!project_id && !description && !notes && !completed) {
        res.status(400).json({error: 'bad request from user'});
        return;
    }
    db('actions').where({id: id}).update({project_id, description, notes, completed}).then(response => {
        if (response === 0) {
            res.status(404).json({error: 'ID not found'});
            return;
        } else if (response === 1) {
            res.status(200).json(['success']);
        };
    }).catch(err => {
        res.status(500).json(err);
    });
});


server.listen(port, () => 
    console.log(`Rock-n-Roll @port: ${port}`)
);

