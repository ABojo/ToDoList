export default (function() {
    const state = {
        projects: [],
        activeProject: null
    }

    const projectProto = {
        getName: function() {return this.name},
        setName: function(data) {this.name = data || 'Default'},
        getToDo: function(id) {return this.items.find(x => x.id === id)},
        getAllToDos: function(){return this.items},
        createToDo: function(obj) {
            const newToDo = ToDoFactory(...obj);
            console.log(newToDo);
            this.items.push(newToDo);
            return newToDo;
        },
        removeToDo: function(toDo){this.items.splice(this.items.findIndex(x => x === toDo), 1)},
        type: 'Project'
    }

    const toDoProto = {
        getTitle: function() {return this.title},
        getDueDate: function() {return this.dueDate},
        getPriority: function() {return this.priority},
        setTitle: function(data) {this.title = data || 'Empty'},
        setDueDate: function(data) {this.dueDate = data || 'Empty'},
        setPriority: function(data) {this.priority = data || 'Empty'},
        swapCompletedStatus: function(){this.completed === true ? this.completed = false : this.completed = true},
        type: 'ToDo'
    }

    const ProjectFactory = (name, items, id) => Object.assign(Object.create(projectProto), {name: name || 'Default', items: items || [], id: id || `${name}-${Date.now()}`});
    const ToDoFactory = (title, dueDate, priority, completed,  id) => Object.assign(Object.create(toDoProto), {title : title || 'Empty', dueDate: dueDate || 'Empty' , priority: priority || 'Empty', completed: completed || false, id: id || `${title}-${Date.now()}`});
   
    const projectListIsEmpty = () => state.projects.length === 0;
    const getAllProjects = () => state.projects
    const getProject = id => state.projects.find(x => x.id === id);
    const createProject = name => {
        const newProject = ProjectFactory(name);
        state.projects.push(newProject);
        persistState();
        return newProject;
    }
    const setActiveProject = project => {
        state.activeProject = project;
        persistState();
    }
    const getActiveProject = () => state.activeProject;
    const deleteActiveProject = () => {
        //Splice active project out of array
        const index = getAllProjects().findIndex(x => x === getActiveProject());
        state.projects.splice(index, 1);

        //if there are no projects left set the active project to null if there are then set the new active project
        if(projectListIsEmpty()) {
            setActiveProject(null);
        } else {
            setActiveProject(state.projects[index === state.projects.length ? index - 1: index]);
        }

        persistState();
    }

    const importState = () => {
        const storedState = JSON.parse(localStorage.getItem('state'));
        //If the user has accessed the site before load their last saved state/if not then create a default project and make it the default
        if(storedState) {
            storedState.projects.forEach(obj => state.projects.push(ProjectFactory(obj.name, obj.items.map(toDo => ToDoFactory(toDo.title, toDo.dueDate, toDo.priority, toDo.completed, toDo.id)), obj.id)));
            storedState.activeProject ?  setActiveProject(state.projects.find(project => project.id === storedState.activeProject.id)) : setActiveProject(null);
        } else {
            const defaultProject = ProjectFactory('Default', [ToDoFactory('First example', '3/15/21', 'high', true), ToDoFactory('Second example', '3/15/21', 'high', false), ToDoFactory('Third example', '3/15/21', 'high', false)], 'default-project');
            state.projects.push(defaultProject);
            setActiveProject(defaultProject);
        }
    };

    const persistState = () => localStorage.setItem('state', JSON.stringify(state));




    return {
        getAllProjects,
        getProject,
        setActiveProject,
        getActiveProject,
        createProject, 
        deleteActiveProject,
        importState,
        persistState,
        projectListIsEmpty
    }
})();