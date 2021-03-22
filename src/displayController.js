import toDoList from './toDoList';

export default (function(){
    //Clean functions
    const newElement = (options) => {
        const element = document.createElement(options.type);
        Object.keys(options).forEach(key => {
            if(key !== 'type') {
                options[key] instanceof Object ? Object.keys(options[key]).forEach(subKey => element[key][subKey] = options[key][subKey]) : element[key] = options[key];
            } 
        });

        return element;
    }

    const removeElement = (selector) => document.querySelector(selector).remove();


    //Passes SRP
    const buildAddProjectButton = () => {
        const sidebar = document.querySelector('.project-sidebar');
        const element = newElement({type: 'h1', className: 'add-project', innerHTML: '<i class="fas fa-plus-circle"></i>Add Project'});
        element.addEventListener('click', buildAddProjectForm);
        sidebar.append(element);
    }


    //Fails SRP. Removes Add project button.
    const buildAddProjectForm = () => {
        removeElement('.add-project');
        const sidebar = document.querySelector('.project-sidebar');
        const addProjectBox = newElement({type: 'div', className: 'add-project__box'});
        const addProjectInput = newElement({type: 'input', className: 'add-project__input', placeholder: 'Project name'});
        const addProjectConfirm = newElement({type: 'button', className: 'add-project__button confirm', textContent: 'Add'});
        const addProjectCancel = newElement({type: 'button', className: 'add-project__button cancel', textContent: 'Cancel'});

        addProjectConfirm.addEventListener('click', function() {
            const projectListIsEmpty = toDoList.projectListIsEmpty();
            //Create new project
            const newProject = toDoList.createProject(addProjectInput.value);

            //if there are no current projects then set the newly created project as active and build the project page
            if(projectListIsEmpty){
                toDoList.setActiveProject(newProject);
                buildActiveProject();
            }

            renderProjectToSidebar(newProject);
            addProjectBox.remove();
            buildAddProjectButton();
        });

        addProjectCancel.addEventListener('click', function() {
            addProjectBox.remove();
            buildAddProjectButton();
        });

        addProjectBox.append(addProjectInput, addProjectConfirm, addProjectCancel);
        sidebar.append(addProjectBox);

        addProjectInput.focus();
    }

    const highlightProject = (element) => {
        const currentlySelected = document.querySelector('.selected');
        if(currentlySelected) currentlySelected.classList.remove('selected');
        if(element) element.classList.add('selected');
    }

    const buildProjectList = () => {
        toDoList.getAllProjects().forEach(project => renderProjectToSidebar(project));
    };

    const renderProjectToSidebar = (newProject) => {
        const projectList = document.querySelector('.project-sidebar__list');
        const element = newElement({type: 'h1', className: `project-sidebar__list-item ${newProject.id === toDoList.getActiveProject().id ? 'selected' : '' }`, innerHTML: `<i class="fas fa-folder"></i> ${newProject.name}`, dataset: {internal: newProject.id}});

        element.addEventListener('click', function() {
            toDoList.setActiveProject(newProject);
            toDoList.persistState();
            highlightProject(this);
            buildActiveProject();
        });

        projectList.append(element);
    }

    const buildToDoRow = (toDo, options) => {
        //If a row was passed in proceed with it if not create a new element to be appended to the grid later
        let itemRow;

        if(options && options.currentRow) {
            itemRow = options.currentRow;
            itemRow.innerHTML = '';
        } else {
            itemRow = newElement({type: 'div', className: 'project-row'});
            const projectGrid = document.querySelector('.project-details__grid');
            projectGrid.append(itemRow);
        }

        const tableMark = newElement({type: 'h1', className: 'table-mark', innerHTML: `${toDo.completed ? '<i class="fas fa-check-circle"></i>' : '<i class="far fa-circle"></i>'}`});
        const title = newElement({type: 'h1', className: 'table-cell', textContent: toDo.title});
        const date = newElement({type: 'h1', className: 'table-cell', textContent: toDo.dueDate});
        const priority = newElement({type: 'h1', className: 'table-cell', textContent: toDo.priority});

        const buttonBox = newElement({type: 'div', className: 'table-buttons'});
        const tableEdit = newElement({type: 'h1', className: 'table-edit', innerHTML: '<i class="far fa-edit"></i>'});
        const tableRemove = newElement({type: 'h1', className: 'table-remove', innerHTML: '<i class="fas fa-times-circle"></i>'});


        tableMark.addEventListener('click', function() {
            //swaps the icon back and forth based on its current state
            this.innerHTML === '<i class="far fa-circle"></i>' ? this.innerHTML = '<i class="fas fa-check-circle"></i>' : this.innerHTML = '<i class="far fa-circle"></i>';
            toDo.swapCompletedStatus();
            toDoList.persistState();
        });

        tableEdit.addEventListener('click', () => {buildToDoForm(toDo, {currentRow: itemRow})});

        tableRemove.addEventListener('click', function() {
            const activeProject = toDoList.getActiveProject();
            activeProject.removeToDo(toDo);
            toDoList.persistState();
            this.parentElement.parentElement.remove();
        });
        
        buttonBox.append(tableEdit, tableRemove);
        itemRow.append(tableMark, title, date, priority, buttonBox);        
    }


    const buildToDoForm = (toDo, options) => {
        //Build elements for new form
        let itemRow;
        const editBadge = newElement({type: 'h1', className: 'table-form-icon', innerHTML: '<i class="far fa-edit"></i>'});
        const nameInput = newElement({type: 'input', className: 'table-input', placeholder: 'Enter task name', value: toDo.title || ''});
        const dateInput = newElement({type: 'input', className: 'table-input', placeholder: 'MM/DD/YYYY', value: toDo.dueDate || ''});
        const priorityInput = newElement({type: 'input', className: 'table-input', placeholder: 'Enter priority level', value: toDo.priority || ''});
        const buttonsBox = newElement({type: 'div', className: 'table-buttons'});
        const confirmButton = newElement({type: 'h1', className: 'table-confirm', innerHTML: '<i class="fas fa-check"></i>'});
        const removeButton = newElement({type: 'h1', className: 'table-remove', innerHTML: '<i class="fas fa-undo-alt"></i>'});            
        buttonsBox.append(confirmButton, removeButton);

        //If an options object is passed in that contains a currentRow property then build the form in that row rather than creating a new row
        if(options && options.currentRow) {
            itemRow = options.currentRow;
            itemRow.innerHTML = '';
        } else {
            const projectGrid = document.querySelector('.project-details__grid')
            itemRow = newElement({type: 'div', className: 'project-row'});
            projectGrid.append(itemRow);
        }
        itemRow.append(editBadge, nameInput, dateInput, priorityInput, buttonsBox);
        nameInput.focus();



        //Add event listeners to confirm and remove button on form
        removeButton.addEventListener('click', function() {
            if(options && options.currentRow) {
                buildToDoRow(toDo, options);
            } else {
                this.parentElement.parentElement.remove();
            }
        });

        confirmButton.addEventListener('click', function() {
            const values = Array.from(this.parentElement.parentElement.children).filter(el=> el.className === 'table-input').map(el => el.value);
            const activeProject = toDoList.getActiveProject();
            
            //If there was no current row passed in then create a new to do object if there was then modify the current to do object
            if(options && options.currentRow) {
                toDo.setTitle(values[0]);
                toDo.setDueDate(values[1]);
                toDo.setPriority(values[2]);
            } else {
                toDo = activeProject.createToDo(values);
            }

            toDoList.persistState();
            buildToDoRow(toDo, {currentRow: itemRow});
        });
    }


    const buildActiveProject = () => {
        const activeProject = toDoList.getActiveProject();
        const projectDetails = document.querySelector('.project-details');
        projectDetails.innerHTML = '';

        if(activeProject)  {
            const projectNameBox = newElement({type: 'div', className: 'project-name'});
            const projectName = newElement({type: 'h1', className: 'project-details__name', innerHTML: `<i class="fas fa-tasks"></i>${activeProject.name}`});
            const projectButtonsBox = newElement({type: 'div', className: 'project-buttons'});
            const editButton = newElement({type: 'h1', className: 'project-edit', innerHTML: '<i class="far fa-edit"></i>'});
            const removeButton = newElement({type: 'h1', className: 'project-remove', innerHTML: '<i class="fas fa-trash-alt"></i>'});
            const projectGrid = newElement({type: 'div', className: 'project-details__grid'});
            const projectRow = newElement({type: 'div', className: 'project-row'});
            const taskHeading = newElement({type: 'h1', className: 'table-heading', textContent: 'Task'});
            const dateHeading = newElement({type: 'h1', className: 'table-heading', textContent: 'Due Date'});
            const priortyHeading = newElement({type: 'h1', className: 'table-heading', textContent: 'Priorty'});
            const addToDoButton = newElement({type: 'h1', className: 'add-to-do', innerHTML: '<i class="fas fa-plus-circle"></i>Add Item'});


            projectButtonsBox.append(editButton, removeButton);
            projectNameBox.append(projectName, projectButtonsBox);
            projectRow.append(taskHeading, dateHeading, priortyHeading);
            projectGrid.append(projectRow);
            projectDetails.append(projectNameBox, projectGrid, addToDoButton);

            const activeProjectToDos = activeProject.getAllToDos();
            activeProjectToDos.forEach(buildToDoRow);
            addToDoButton.addEventListener('click', buildToDoForm);

            removeButton.addEventListener('click', buildProjectDeletePopup);
            editButton.addEventListener('click', () => {
                projectName.style.display = 'none';
                projectButtonsBox.style.display = 'none';

                const changeNameBox = newElement({type: 'div', className: 'change-name-box'});
                const changeNameInput = newElement({type: 'input', className: 'change-name-input', value: `${activeProject.name}`});
                const changeNameButtonsBox = newElement({type: 'div', className: 'change-name-buttonsBox'});
                const changeNameConfirm = newElement({type: 'h1', className: 'change-name-button confirm', innerHTML: '<i class="fas fa-check"></i>'});
                const changeNameBack = newElement({type: 'h1', className: 'change-name-button reject', innerHTML: '<i class="fas fa-undo-alt"></i>'});

                changeNameButtonsBox.append(changeNameConfirm, changeNameBack);
                changeNameBox.append(changeNameInput, changeNameButtonsBox);
                projectNameBox.append(changeNameBox);

                changeNameInput.focus();



                changeNameBack.addEventListener('click', function() {
                    projectName.style.display = 'block';
                    projectButtonsBox.style.display = 'block';
                    changeNameBox.remove();
                });

                changeNameConfirm.addEventListener('click', function() {
                    activeProject.setName(changeNameInput.value);
                    toDoList.persistState();
                    

                    document.querySelector('.selected').innerHTML = `<i class="fas fa-folder"></i> ${activeProject.name}`
                    projectName.innerHTML = `<i class="fas fa-tasks"></i>${activeProject.name}`;
                    projectName.style.display = 'block';
                    projectButtonsBox.style.display = 'block';
                    changeNameBox.remove();
                });


            });
        } else {
           const noProjects = newElement({type: 'h1', className: 'no-projects', textContent: 'You have no projects!'});
           projectDetails.append(noProjects);
        }
    }



    const buildProjectDeletePopup = () => {
        const popup = newElement({type: 'div', className: 'popup'});
        const popupBox = newElement({type: 'div', className :'popup__box'});
        const popupHeading = newElement({type: 'h1', className: 'popup__heading', textContent: 'Are you sure you want to delete this project?'});
        const confirmButton = newElement({type: 'button', className: 'popup-button confirm', textContent: 'Yes'});
        const rejectButton = newElement({type: 'button', className: 'popup-button reject', textContent: 'No'});

        popupBox.append(popupHeading, confirmButton, rejectButton);
        popup.append(popupBox);
        document.body.append(popup);

        rejectButton.addEventListener('click', () => {popup.remove()});
        confirmButton.addEventListener('click', () => {
            toDoList.deleteActiveProject();
            document.querySelector('.selected').remove();
            if(toDoList.getActiveProject()) highlightProject(document.querySelector(`[data-internal="${toDoList.getActiveProject().id}"]`));
            buildActiveProject();
            popup.remove();
        });
    }


    const loadUI = () => {
        buildProjectList();
        buildAddProjectButton();
        buildActiveProject();
    }

    return {
        loadUI
    }
})();