document.addEventListener('DOMContentLoaded', function() {
    // Check if UUID library is available
    if (typeof uuid === 'undefined') {
        console.error('UUID library is not loaded. Please include the UUID library in your HTML file.');
        alert('UUID library is missing. Please check the console for more information.');
        return;
    }
    
    // Data storage
    let data = {
        groups: [],
        filters: []
    };

    // DOM elements
    const groupForm = document.getElementById('groupForm');
    const filterForm = document.getElementById('filterForm');
    const groupsContainer = document.getElementById('groupsContainer');
    const filtersContainer = document.getElementById('filtersContainer');
    const jsonOutput = document.getElementById('jsonOutput');
    const filterGroup = document.getElementById('filterGroup');
    const copyJsonBtn = document.getElementById('copyJsonBtn');
    const importJsonBtn = document.getElementById('importJsonBtn');
    const downloadJsonBtn = document.getElementById('downloadJsonBtn');
    const resetAllBtn = document.getElementById('resetAllBtn');
    const importJson = document.getElementById('importJson');

    // Color input synchronization
    document.getElementById('groupColor').addEventListener('input', function(e) {
        document.getElementById('groupColorHex').value = e.target.value;
        document.getElementById('groupColorPreview').style.backgroundColor = e.target.value;
    });

    document.getElementById('groupColorHex').addEventListener('input', function(e) {
        document.getElementById('groupColor').value = e.target.value;
        document.getElementById('groupColorPreview').style.backgroundColor = e.target.value;
    });

    document.getElementById('tagColor').addEventListener('input', function(e) {
        document.getElementById('tagColorHex').value = e.target.value;
        updateTagPreview();
    });

    document.getElementById('tagColorHex').addEventListener('input', function(e) {
        document.getElementById('tagColor').value = e.target.value;
        updateTagPreview();
    });

    document.getElementById('textColor').addEventListener('input', function(e) {
        document.getElementById('textColorHex').value = e.target.value;
        updateTagPreview();
    });

    document.getElementById('textColorHex').addEventListener('input', function(e) {
        document.getElementById('textColor').value = e.target.value;
        updateTagPreview();
    });
    
    // Add tag style change listener for preview
    document.getElementById('tagStyle').addEventListener('change', updateTagPreview);
    document.getElementById('filterName').addEventListener('input', updateTagPreview);
    document.getElementById('imageURL').addEventListener('input', updateTagPreview);
    
    // Function to update tag preview
    function updateTagPreview() {
        const tagPreviewElement = document.getElementById('tagPreview');
        if (!tagPreviewElement) {
            // Create the preview element if it doesn't exist
            const previewContainer = document.createElement('div');
            previewContainer.className = 'mb-3 mt-3';
            previewContainer.innerHTML = `
                <label class="form-label">Tag Preview</label>
                <div class="p-2 border rounded d-flex align-items-center">
                    <span id="tagPreview" class="badge">Preview</span>
                </div>
            `;
            
            // Insert after the text color input
            const textColorField = document.getElementById('textColorHex').closest('.mb-3');
            textColorField.parentNode.insertBefore(previewContainer, textColorField.nextSibling);
        }
        
        // Update the preview
        const tagPreview = document.getElementById('tagPreview');
        const tagStyle = document.getElementById('tagStyle').value;
        const tagColor = document.getElementById('tagColor').value;
        const textColor = document.getElementById('textColor').value;
        const filterName = document.getElementById('filterName').value.trim() || 'Preview';
        
        tagPreview.textContent = filterName;
        
        if (tagStyle === 'filled') {
            tagPreview.style.backgroundColor = tagColor;
            tagPreview.style.color = textColor;
            tagPreview.style.border = 'none';
        } else {
            tagPreview.style.backgroundColor = 'transparent';
            tagPreview.style.color = tagColor;
            tagPreview.style.border = `1px solid ${tagColor}`;
        }
    }

    // Add Group
    document.getElementById('addGroupBtn').addEventListener('click', function() {
        const name = document.getElementById('groupName').value.trim();
        const color = document.getElementById('groupColor').value;
        const isExpanded = document.getElementById('groupExpanded').checked;

        if (!name) {
            alert('Please enter a group name');
            return;
        }

        const group = {
            id: uuid.v4(), // Changed from UUID.v4() to lowercase uuid.v4()
            name: name,
            color: color,
            isExpanded: isExpanded
        };

        data.groups.push(group);
        updateGroupsList();
        updateFilterGroupDropdown();
        updateJsonOutput();
        groupForm.reset();
        document.getElementById('groupColor').value = '#96CEB4';
        document.getElementById('groupColorHex').value = '#96CEB4';
        document.getElementById('groupColorPreview').style.backgroundColor = '#96CEB4';
        document.getElementById('groupExpanded').checked = true;
    });

    // Add Filter
    document.getElementById('addFilterBtn').addEventListener('click', function() {
        const name = document.getElementById('filterName').value.trim();
        const pattern = document.getElementById('filterPattern').value.trim();
        const groupId = document.getElementById('filterGroup').value;
        const tagStyle = document.getElementById('tagStyle').value;
        const tagColor = document.getElementById('tagColor').value;
        const textColor = document.getElementById('textColor').value;
        const imageURL = document.getElementById('imageURL').value.trim();
        const isEnabled = document.getElementById('filterEnabled').checked;

        if (!name || !pattern) {
            alert('Please enter a filter name and pattern');
            return;
        }

        if (!groupId) {
            alert('Please select a group for this filter');
            return;
        }

        const filter = {
            id: uuid.v4(), // Changed from UUID.v4() to lowercase uuid.v4()
            name: name,
            pattern: pattern,
            type: 'filter',
            isEnabled: isEnabled,
            tagStyle: tagStyle,
            tagColor: tagColor,
            textColor: textColor,
            imageURL: imageURL,
            groupId: groupId
        };

        data.filters.push(filter);
        updateFiltersList();
        updateJsonOutput();
        filterForm.reset();
        document.getElementById('tagColor').value = '#000000';
        document.getElementById('tagColorHex').value = '#000000';
        document.getElementById('textColor').value = '#FFFFFF';
        document.getElementById('textColorHex').value = '#FFFFFF';
        document.getElementById('filterEnabled').checked = true;
        document.getElementById('tagStyle').value = 'filled';
    });

    // Update Groups List
    function updateGroupsList() {
        groupsContainer.innerHTML = '';
        
        if (data.groups.length === 0) {
            groupsContainer.innerHTML = '<p class="text-muted">No groups added yet</p>';
            return;
        }

        data.groups.forEach((group, index) => {
            const groupElement = document.createElement('div');
            groupElement.className = 'group-item p-3 mb-2 border rounded';
            groupElement.style.borderLeftColor = group.color;
            
            groupElement.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="mb-1">${group.name}</h5>
                        <small class="text-muted">ID: ${group.id}</small>
                        <div class="mt-1">
                            <span class="badge bg-light text-dark">Color: ${group.color}</span>
                            <span class="badge bg-light text-dark">Expanded: ${group.isExpanded ? 'Yes' : 'No'}</span>
                        </div>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-primary edit-group" data-index="${index}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-group" data-index="${index}">Delete</button>
                    </div>
                </div>
            `;
            
            groupsContainer.appendChild(groupElement);
        });

        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.edit-group').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                editGroup(index);
            });
        });

        document.querySelectorAll('.delete-group').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                deleteGroup(index);
            });
        });
    }

    // Update Filters List
    function updateFiltersList() {
        filtersContainer.innerHTML = '';
        
        if (data.filters.length === 0) {
            filtersContainer.innerHTML = '<p class="text-muted">No filters added yet</p>';
            return;
        }

        data.filters.forEach((filter, index) => {
            const group = data.groups.find(g => g.id === filter.groupId);
            const groupName = group ? group.name : 'Unknown Group';
            
            const filterElement = document.createElement('div');
            filterElement.className = 'filter-item p-3 mb-2 border rounded';
            filterElement.style.borderLeftColor = filter.tagColor;
            filterElement.draggable = true; // Make element draggable
            filterElement.setAttribute('data-index', index); // Store the index for drag events
            
            filterElement.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="mb-1">${filter.name}</h5>
                        <small class="text-muted">Group: ${groupName}</small>
                        <div class="mt-1 d-flex align-items-center">
                            <span class="badge bg-light text-dark me-2" style="min-width: auto;">Style: ${filter.tagStyle}</span>
                            <span class="badge" style="background-color: ${filter.tagColor}; color: ${filter.textColor}; margin-right: 4px;">${filter.name}</span>
                            <span class="badge bg-light text-dark">Enabled: ${filter.isEnabled ? 'Yes' : 'No'}</span>
                        </div>
                        <div class="mt-2">
                            <small class="text-muted">Pattern: ${filter.pattern.substring(0, 50)}${filter.pattern.length > 50 ? '...' : ''}</small>
                        </div>
                        ${filter.imageURL ? `<div class="mt-2"><small class="text-muted">Image: <a href="${filter.imageURL}" target="_blank">${filter.imageURL.substring(0, 30)}${filter.imageURL.length > 30 ? '...' : ''}</a></small></div>` : ''}
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-primary edit-filter" data-index="${index}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-filter" data-index="${index}">Delete</button>
                    </div>
                </div>
            `;
            
            filtersContainer.appendChild(filterElement);
        });

        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.edit-filter').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                editFilter(index);
            });
        });

        document.querySelectorAll('.delete-filter').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                deleteFilter(index);
            });
        });
        
        // Add drag and drop event listeners
        setupDragAndDrop();
    }
    
    // Setup drag and drop functionality for filters
    function setupDragAndDrop() {
        const filterItems = document.querySelectorAll('.filter-item');
        
        filterItems.forEach(item => {
            // Drag start event - store the source element index
            item.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('text/plain', e.target.getAttribute('data-index'));
                setTimeout(() => {
                    e.target.classList.add('dragging');
                }, 0);
            });
            
            // Drag end event - remove visual cues
            item.addEventListener('dragend', function(e) {
                e.target.classList.remove('dragging');
            });
            
            // Drag over event - prevent default to allow drop
            item.addEventListener('dragover', function(e) {
                e.preventDefault();
            });
            
            // Drag enter event - add visual cue
            item.addEventListener('dragenter', function(e) {
                e.preventDefault();
                this.classList.add('drag-over');
            });
            
            // Drag leave event - remove visual cue
            item.addEventListener('dragleave', function() {
                this.classList.remove('drag-over');
            });
            
            // Drop event - handle the reordering
            item.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('drag-over');
                
                const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
                const targetIndex = parseInt(this.getAttribute('data-index'));
                
                if (sourceIndex !== targetIndex) {
                    // Reorder the filters array
                    const [movedFilter] = data.filters.splice(sourceIndex, 1);
                    data.filters.splice(targetIndex, 0, movedFilter);
                    
                    // Update the UI
                    updateFiltersList();
                    updateJsonOutput();
                }
            });
        });
    }

    // Update Filter Group Dropdown
    function updateFilterGroupDropdown() {
        filterGroup.innerHTML = '<option value="">Select a group</option>';
        
        data.groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = group.name;
            filterGroup.appendChild(option);
        });
    }

    // Edit Group
    function editGroup(index) {
        const group = data.groups[index];
        
        document.getElementById('groupName').value = group.name;
        document.getElementById('groupColor').value = group.color;
        document.getElementById('groupColorHex').value = group.color;
        document.getElementById('groupColorPreview').style.backgroundColor = group.color;
        document.getElementById('groupExpanded').checked = group.isExpanded;
        
        // Remove the group from the array
        data.groups.splice(index, 1);
        
        // Update UI
        updateGroupsList();
        updateFilterGroupDropdown();
        updateJsonOutput();
        
        // Scroll to the form
        groupForm.scrollIntoView({ behavior: 'smooth' });
    }

    // Delete Group
    function deleteGroup(index) {
        if (!confirm('Are you sure you want to delete this group? All filters associated with this group will also be deleted.')) {
            return;
        }
        
        const groupId = data.groups[index].id;
        
        // Remove the group
        data.groups.splice(index, 1);
        
        // Remove all filters associated with this group
        data.filters = data.filters.filter(filter => filter.groupId !== groupId);
        
        // Update UI
        updateGroupsList();
        updateFiltersList();
        updateFilterGroupDropdown();
        updateJsonOutput();
    }

    // Edit Filter
    function editFilter(index) {
        const filter = data.filters[index];
        
        document.getElementById('filterName').value = filter.name;
        document.getElementById('filterPattern').value = filter.pattern;
        document.getElementById('filterGroup').value = filter.groupId;
        document.getElementById('tagStyle').value = filter.tagStyle;
        document.getElementById('tagColor').value = filter.tagColor;
        document.getElementById('tagColorHex').value = filter.tagColor;
        document.getElementById('textColor').value = filter.textColor;
        document.getElementById('textColorHex').value = filter.textColor;
        document.getElementById('imageURL').value = filter.imageURL;
        document.getElementById('filterEnabled').checked = filter.isEnabled;
        
        // Remove the filter from the array
        data.filters.splice(index, 1);
        
        // Update UI
        updateFiltersList();
        updateJsonOutput();
        
        // Scroll to the form
        filterForm.scrollIntoView({ behavior: 'smooth' });
    }

    // Delete Filter
    function deleteFilter(index) {
        if (!confirm('Are you sure you want to delete this filter?')) {
            return;
        }
        
        // Remove the filter
        data.filters.splice(index, 1);
        
        // Update UI
        updateFiltersList();
        updateJsonOutput();
    }

    // Update JSON Output
    function updateJsonOutput() {
        jsonOutput.textContent = JSON.stringify(data, null, 2);
    }

    // Copy JSON to Clipboard
    copyJsonBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2))
            .then(() => {
                alert('JSON copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                alert('Failed to copy JSON to clipboard');
            });
    });

    // Import JSON
    importJsonBtn.addEventListener('click', function() {
        try {
            const importedData = JSON.parse(importJson.value);
            
            if (!importedData.groups || !importedData.filters) {
                throw new Error('Invalid JSON format. Must contain groups and filters arrays.');
            }
            
            data = importedData;
            
            // Update UI
            updateGroupsList();
            updateFiltersList();
            updateFilterGroupDropdown();
            updateJsonOutput();
            
            alert('JSON imported successfully!');
            importJson.value = '';
        } catch (error) {
            alert('Error importing JSON: ' + error.message);
        }
    });

    // Download JSON File
    downloadJsonBtn.addEventListener('click', function() {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'filters.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Reset All Data
    resetAllBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
            data = {
                groups: [],
                filters: []
            };
            
            // Update UI
            updateGroupsList();
            updateFiltersList();
            updateFilterGroupDropdown();
            updateJsonOutput();
            
            alert('All data has been reset.');
        }
    });

    // Initialize UI
    updateGroupsList();
    updateFiltersList();
    updateFilterGroupDropdown();
    updateJsonOutput();
});