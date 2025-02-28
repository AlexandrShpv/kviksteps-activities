// Function to add draggable column functionality to the table
function makeTableColumnsDraggable(table) {
  const thead = table.querySelector('thead');
  if (!thead) return;
  
  const headerRow = thead.querySelector('tr');
  if (!headerRow) return;
  
  const headers = headerRow.querySelectorAll('th');
  let draggedHeader = null;
  let startX = 0;
  let startWidth = 0;
  
  // Remove fixed table layout to allow auto-sizing
  table.style.tableLayout = 'auto';
  
  // Set initial column widths based on content
  headers.forEach(header => {
      header.style.width = 'auto'; // Allow columns to auto-size
      header.style.whiteSpace = 'nowrap'; // Prevent text wrapping
  });
  
  // Force the table to calculate its layout
  table.offsetHeight; // Trigger reflow
  
  // Now set the calculated widths
  headers.forEach(header => {
      const width = header.offsetWidth + 20; // Add padding
      header.style.width = `${width}px`;
  });
  
  // Lock the table layout to enforce the set widths
  table.style.tableLayout = 'fixed'; // Add this line  

  // Create and append resizers to each header cell
  headers.forEach((header, index) => {
    // Don't add resizer to the last column
    if (index < headers.length - 1) {
      // Position the header cell relatively
      header.style.position = 'relative';
      
      // Create the resizer element
      const resizer = document.createElement('div');
      resizer.className = 'column-resizer';
      resizer.style.position = 'absolute';
      resizer.style.top = '0';
      resizer.style.right = '0';
      resizer.style.width = '5px';
      resizer.style.height = '100%';
      resizer.style.background = 'transparent';
      resizer.style.cursor = 'col-resize';
      resizer.style.userSelect = 'none';
      resizer.style.zIndex = '1';
      
      // Add hover effect
      resizer.addEventListener('mouseover', () => {
        resizer.style.background = '#ccc';
      });
      
      resizer.addEventListener('mouseout', () => {
        resizer.style.background = 'transparent';
      });
      
      // Add the resizer to the header
      header.appendChild(resizer);
      
      // Attach drag event handlers
      resizer.addEventListener('mousedown', (e) => {
        draggedHeader = header;
        startX = e.pageX;
        startWidth = header.offsetWidth;
        
        // Prevent text selection during drag
        document.body.style.userSelect = 'none';
        
        // Add visual feedback
        resizer.style.background = '#0078d7';
        
        // Add event listeners for drag movement and end
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        
        // Prevent default to stop text selection
        e.preventDefault();
      });
    }
  });
  
  // Mouse move handler
  function onMouseMove(e) {
    if (draggedHeader) {
      // Calculate new width
      const newWidth = Math.max(50, startWidth + (e.pageX - startX));
      
      // Apply new width
      draggedHeader.style.width = newWidth + 'px';
      
      // Show width in a tooltip or status indicator
      updateDragStatus(newWidth);
    }
  }
  
  // Mouse up handler
  function onMouseUp() {
    if (draggedHeader) {
      // Reset dragging state
      const resizer = draggedHeader.querySelector('.column-resizer');
      if (resizer) {
        resizer.style.background = 'transparent';
      }
      
      draggedHeader = null;
      
      // Remove event listeners
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      
      // Re-enable text selection
      document.body.style.userSelect = '';
      
      // Hide width indicator
      hideDragStatus();
    }
  }
  
  // Create status indicator for column resizing
  const statusIndicator = document.createElement('div');
  statusIndicator.id = 'column-resize-status';
  statusIndicator.style.position = 'fixed';
  statusIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  statusIndicator.style.color = 'white';
  statusIndicator.style.padding = '5px 8px';
  statusIndicator.style.borderRadius = '3px';
  statusIndicator.style.fontSize = '12px';
  statusIndicator.style.zIndex = '1000';
  statusIndicator.style.display = 'none';
  document.body.appendChild(statusIndicator);
  
  // Function to update the drag status indicator
  function updateDragStatus(width) {
    statusIndicator.textContent = `Width: ${width}px`;
    statusIndicator.style.display = 'block';
    statusIndicator.style.left = (event.pageX + 10) + 'px';
    statusIndicator.style.top = (event.pageY + 10) + 'px';
  }
  
  // Function to hide the drag status indicator
  function hideDragStatus() {
    statusIndicator.style.display = 'none';
  }
  
  // Add double-click to reset column width
  headers.forEach(header => {
    const resizer = header.querySelector('.column-resizer');
    if (resizer) {
      resizer.addEventListener('dblclick', () => {
        // Reset to auto width
        header.style.width = 'auto';
        table.style.tableLayout = 'auto'; // Re-enable auto layout
        table.offsetHeight; // Trigger reflow
        const width = header.offsetWidth + 20; // Add padding
        header.style.width = `${width}px`; // Set new width
        table.style.tableLayout = 'fixed'; // Add this line to enforce the width
      });
    }
  });
  
  // Add instructions above the table
  const instructionText = document.createElement('div');
  instructionText.innerHTML = '<small><em>Tip: Drag column edges to resize. Double-click column edge to reset width.</em></small>';
  instructionText.style.marginBottom = '5px';
  instructionText.style.color = '#666';
  table.parentNode.insertBefore(instructionText, table);
  
  // Store initial column widths
  const initialWidths = Array.from(headers).map(header => header.offsetWidth);
  
  // Add reset button
  const resetButton = document.createElement('button');
  resetButton.textContent = 'Reset Column Widths';
  resetButton.style.marginBottom = '10px';
  resetButton.style.padding = '4px 8px';
  resetButton.style.fontSize = '12px';
  resetButton.style.cursor = 'pointer';
  resetButton.style.backgroundColor = '#f0f0f0';
  resetButton.style.border = '1px solid #ccc';
  resetButton.style.borderRadius = '3px';
  
  resetButton.addEventListener('click', () => {
    headers.forEach((header, index) => {
      if (index < initialWidths.length) {
        header.style.width = 'auto'; // Reset to auto width
        table.style.tableLayout = 'auto'; // Re-enable auto layout
        table.offsetHeight; // Trigger reflow
        const width = header.offsetWidth + 20; // Add padding
        header.style.width = `${width}px`; // Set new width
      }
    });
    table.style.tableLayout = 'fixed'; // Add this line to enforce the widths
  });
  
  table.parentNode.insertBefore(resetButton, instructionText);
  
  return 'Added draggable column functionality to table';
}
  

// Function to extract datetime from an issue-data-block
function extractDatetime(block) {
  const timeElement = block.querySelector('time.livestamp');
  return timeElement ? timeElement.getAttribute('datetime') : null;
}

// Function to extract user from an issue-data-block
function extractUser(block) {
  const userElement = block.querySelector('.user-hover');
  return userElement ? userElement.textContent.trim() : '';
}

// Function to extract comment text from a comment block
function extractComment(block) {
  // Check if this is a comment block
  if (block.classList.contains('activity-comment')) {
    const commentBody = block.querySelector('.action-body.flooded');
    if (commentBody) {
      return commentBody.textContent.trim();
    }
  }
  return '';
}

// Function to extract all available field names
function getAllActivityNames() {
  // Use a Set to get unique activity names
  return [...new Set(Array.from(document.querySelectorAll('.activity-name')).map(element => element.textContent.trim()))];
}

// Function to extract field data from the changelog
function extractFieldData(block, fieldName) {
  // Find activity-name that matches the field
  const activityRows = block.querySelectorAll('tr');
  for (const row of activityRows) {
    const activityName = row.querySelector('.activity-name');
    if (activityName && activityName.textContent.trim() === fieldName) {
      const newVal = row.querySelector('.activity-new-val');
      if (newVal) {
        // Strip "Jaunā vērtība" and return only the actual value
        return newVal.textContent.replace('Jaunā vērtība', '').trim();
      }
    }
  }
  return '';
}

// Function to group blocks by exact datetime (both date and time)
function groupByDatetime() {
  // Get all issue data blocks
  const issueBlocks = document.querySelectorAll('.issue-data-block');
  
  // Get all unique activity names for dynamic headers
  const activityNames = getAllActivityNames();
  
  // Create a map to group blocks by exact datetime
  const datetimeGroups = {};
  
  // Store consolidated information for each datetime group
  const consolidatedGroupData = {};
  
  // Process each block
  issueBlocks.forEach(block => {
    const datetime = extractDatetime(block);
    if (datetime) {
      // Use the full datetime for grouping (up to the minute)
      // Format: YYYY-MM-DDTHH:MM
      const datetimeKey = datetime.substring(0, 16);
      
      if (!datetimeGroups[datetimeKey]) {
        datetimeGroups[datetimeKey] = [];
      }
      
      datetimeGroups[datetimeKey].push(block);
      
      // Extract user
      const user = extractUser(block);
      
      // Extract comment if this is a comment block
      const comment = extractComment(block);
      
      // Initialize or update consolidated data for this datetime
      if (!consolidatedGroupData[datetimeKey]) {
        consolidatedGroupData[datetimeKey] = {
          user: new Set(),
          comments: new Set()
        };
        
        // Initialize a Set for each activity name
        activityNames.forEach(name => {
          consolidatedGroupData[datetimeKey][name] = new Set();
        });
      }
      
      // Add user if not empty
      if (user) consolidatedGroupData[datetimeKey].user.add(user);
      
      // Add comment if not empty
      if (comment) consolidatedGroupData[datetimeKey].comments.add(comment);
      
      // Extract and add data for each activity field
      activityNames.forEach(activityName => {
        const fieldValue = extractFieldData(block, activityName);
        if (fieldValue) {
          consolidatedGroupData[datetimeKey][activityName].add(fieldValue);
        }
      });
    }
  });
  
  // Apply visual grouping
  let groupIndex = 0;
  const backgroundColors = ['#f7f7f7', '#eef5fd']; // Alternating background colors

  Object.entries(datetimeGroups).forEach(([datetime, blocks]) => {
    // Format the datetime for display
    const [datePart, timePart] = datetime.split('T');
    const [year, month, day] = datePart.split('-');
    const [hour, minute] = timePart.split(':');
    const formattedDatetime = `${day}.${month}.${year} ${hour}:${minute}`;
    
    // Create a header for this datetime group
    const header = document.createElement('div');
    header.className = 'datetime-group-header';
    header.textContent = `Activities at ${formattedDatetime}`;
    header.style.padding = '8px';
    header.style.margin = '10px 0 5px 0';
    header.style.backgroundColor = '#e1e1e1';
    header.style.fontWeight = 'bold';
    header.style.borderRadius = '3px';
    header.style.fontSize = '0.9em';
    
    // Create a container for the group
    const groupContainer = document.createElement('div');
    groupContainer.className = 'datetime-group-container';
    groupContainer.style.backgroundColor = backgroundColors[groupIndex % 2];
    groupContainer.style.padding = '5px';
    groupContainer.style.marginBottom = '5px';
    groupContainer.style.borderRadius = '3px';
    
    // Insert the header before the first block in this group
    const parentContainer = blocks[0].parentNode;
    parentContainer.insertBefore(groupContainer, blocks[0]);
    
    // Add the header to the group container
    groupContainer.appendChild(header);
    
    // Move all blocks to the group container and style them
    blocks.forEach(block => {
      // Remove the block from its current location
      parentContainer.removeChild(block);
      
      // Add it to our group container
      groupContainer.appendChild(block);
      
      // Style the block
      block.style.marginLeft = '15px';
      block.style.borderLeft = '2px solid #ccc';
      block.style.paddingLeft = '10px';
    });
    
    // Increment group index for alternating colors
    groupIndex++;
  });
  
  // Create a detailed summary table below all groups
  createDetailedSummaryTable(datetimeGroups, consolidatedGroupData, activityNames);
  
  return `Grouped ${issueBlocks.length} items into ${Object.keys(datetimeGroups).length} datetime groups with alternating backgrounds`;
}

// Function to create a tooltip element
function createTooltip() {
  const tooltip = document.createElement('div');
  tooltip.id = 'cell-tooltip';
  tooltip.style.position = 'absolute';
  tooltip.style.display = 'none';
  tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  tooltip.style.color = '#fff';
  tooltip.style.padding = '8px 12px';
  tooltip.style.borderRadius = '4px';
  tooltip.style.fontSize = '0.85em';
  tooltip.style.zIndex = '9999';
  tooltip.style.pointerEvents = 'none';
  tooltip.style.maxWidth = '300px';
  tooltip.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
  document.body.appendChild(tooltip);
  return tooltip;
}

// Function to create a detailed summary table
function createDetailedSummaryTable(datetimeGroups, consolidatedGroupData, activityNames) {
  // Find the container
  const container = document.querySelector('.issuePanelContainer');
  if (!container) return;
  
  // Create a section divider
  const divider = document.createElement('hr');
  divider.style.margin = '20px 0';
  container.appendChild(divider);
  
  // Create a heading for the summary table
  const heading = document.createElement('h3');
  heading.textContent = 'Activity Details Summary';
  heading.style.margin = '15px 0';
  container.appendChild(heading);
  
  // Create the table
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.marginBottom = '20px';
  table.style.fontSize = '0.85em';
  table.style.tableLayout = 'fixed'; // Added fixed layout for better column resizing
  container.appendChild(table);
  
  // Create table header
  const thead = document.createElement('thead');
  table.appendChild(thead);
  
  const headerRow = document.createElement('tr');
  thead.appendChild(headerRow);
  
  // Build headers list with Comments in the third position
  const headers = ['Datetime', 'User', 'Comments', ...activityNames];
  
  headers.forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    th.style.backgroundColor = '#f0f0f0';
    th.style.padding = '8px';
    th.style.border = '1px solid #ddd';
    th.style.textAlign = 'left';
    th.style.overflow = 'hidden';
    th.style.textOverflow = 'ellipsis';
    th.style.whiteSpace = 'nowrap';
    headerRow.appendChild(th);
  });
  
  // Create table body
  const tbody = document.createElement('tbody');
  table.appendChild(tbody);
  
  // Add rows for each datetime group (one row per datetime)
  let rowCount = 0;
  
  // Process each datetime group
  Object.entries(datetimeGroups).forEach(([datetime, blocks]) => {
    // Format datetime for display
    const [datePart, timePart] = datetime.split('T');
    const [year, month, day] = datePart.split('-');
    const [hour, minute] = timePart.split(':');
    const formattedDatetime = `${day}.${month}.${year} ${hour}:${minute}`;
    
    // Get consolidated data for this datetime
    const groupData = consolidatedGroupData[datetime];
    if (!groupData) return;
    
    // Create a single row for this datetime
    const row = document.createElement('tr');
    row.style.backgroundColor = rowCount % 2 === 0 ? '#fff' : '#f9f9f9';
    tbody.appendChild(row);
    
    // Function to convert Set to comma-separated string
    const setToString = (set) => Array.from(set).join(', ');
    
    // Create cell for datetime (1st column)
    const datetimeCell = document.createElement('td');
    datetimeCell.textContent = formattedDatetime;
    datetimeCell.style.padding = '8px';
    datetimeCell.style.border = '1px solid #ddd';
    datetimeCell.style.overflow = 'hidden';
    datetimeCell.style.textOverflow = 'ellipsis';
    row.appendChild(datetimeCell);
    
    // Create cell for user (2nd column)
    const userCell = document.createElement('td');
    userCell.textContent = setToString(groupData.user);
    userCell.style.padding = '8px';
    userCell.style.border = '1px solid #ddd';
    userCell.style.overflow = 'hidden';
    userCell.style.textOverflow = 'ellipsis';
    row.appendChild(userCell);
    
    // Create cell for comments (3rd column)
    const commentsCell = document.createElement('td');
    const comments = groupData.comments;
    commentsCell.textContent = comments ? setToString(comments) : '';
    commentsCell.style.padding = '8px';
    commentsCell.style.border = '1px solid #ddd';
    commentsCell.style.overflow = 'hidden';
    commentsCell.style.textOverflow = 'ellipsis';
    row.appendChild(commentsCell);
    
    // Create cells for each activity name (remaining columns)
    activityNames.forEach(activityName => {
      const cell = document.createElement('td');
      const activitySet = groupData[activityName];
      cell.textContent = activitySet ? setToString(activitySet) : '';
      cell.style.padding = '8px';
      cell.style.border = '1px solid #ddd';
      cell.style.overflow = 'hidden';
      cell.style.textOverflow = 'ellipsis';
      row.appendChild(cell);
    });
    rowCount++;
  });
  
  // Add tooltip functionality to table cells
  addTooltipsToTable(table, headers);
  
  // Add export buttons
  addExportButtons(container, table);
  
  // Make columns draggable
  makeTableColumnsDraggable(table);
}

// Function to add tooltips to table cells
function addTooltipsToTable(table, headers) {
  // Create tooltip element
  const tooltip = createTooltip();
  
  // Get all data cells (td) from the table
  const cells = table.querySelectorAll('tbody td');
  
  cells.forEach((cell, index) => {
    // Calculate which row and column this cell belongs to
    const rowIndex = Math.floor(index / headers.length);
    const columnIndex = index % headers.length;
    
    // Get header for this column
    const headerText = headers[columnIndex];
    
    // Add event listeners for mouse events
    cell.addEventListener('mouseover', (e) => {
      // Check if the text is truncated (overflowing)
      const isTruncated = cell.scrollWidth > cell.clientWidth;
      
        // Get the row data for datetime and user (first two columns)
        const row = cell.parentElement;
        const datetime = row.cells[0].textContent;
        const user = row.cells[1].textContent;
        
        // Create tooltip content
        tooltip.innerHTML = `<strong>${headerText}</strong><br>
                            ${datetime}: ${user}<br><br>
                            <strong>Full content:</strong><br>
                            ${cell.textContent}`;
        
        // Position the tooltip near the cursor
        tooltip.style.display = 'block';
        tooltip.style.left = (e.pageX + 15) + 'px';
        tooltip.style.top = (e.pageY + 15) + 'px';
        
        // Add highlighting to the cell
        cell.style.backgroundColor = '#ffffe0';
    });
    
    cell.addEventListener('mousemove', (e) => {
      if (tooltip.style.display === 'block') {
        // Reposition the tooltip when mouse moves
        tooltip.style.left = (e.pageX + 15) + 'px';
        tooltip.style.top = (e.pageY + 15) + 'px';
      }
    });
    
    cell.addEventListener('mouseout', () => {
      // Hide the tooltip
      tooltip.style.display = 'none';
      
      // Remove cell highlighting
      const originalRowColor = cell.parentElement.style.backgroundColor;
      cell.style.backgroundColor = originalRowColor;
    });
    
    // Improve visual indication that cells are hoverable
    cell.style.cursor = 'help';
    cell.style.transition = 'background-color 0.2s';
  });
}

// Function to add export buttons
function addExportButtons(container, table) {
  const buttonContainer = document.createElement('div');
  buttonContainer.style.marginBottom = '20px';
  container.appendChild(buttonContainer);
  
  // CSV Export button
  const csvButton = document.createElement('button');
  csvButton.textContent = 'Export to CSV';
  csvButton.style.padding = '8px 16px';
  csvButton.style.marginRight = '10px';
  csvButton.style.backgroundColor = '#f0f0f0';
  csvButton.style.border = '1px solid #ccc';
  csvButton.style.borderRadius = '3px';
  csvButton.style.cursor = 'pointer';
  
  csvButton.addEventListener('click', () => {
    exportTableToCSV(table, 'activity_summary.csv');
  });
  
  buttonContainer.appendChild(csvButton);
}

// Function to export table to CSV
function exportTableToCSV(table, filename) {
  const rows = table.querySelectorAll('tr');
  const csvContent = [];
  
  rows.forEach(row => {
    const rowData = [];
    const cells = row.querySelectorAll('th, td');
    
    cells.forEach(cell => {
      // Quote the cell content and escape any quotes inside
      let content = cell.textContent.trim();
      content = content.replace(/"/g, '""');
      rowData.push(`"${content}"`);
    });
    
    csvContent.push(rowData.join(','));
  });
  
  const csvString = csvContent.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  if (navigator.msSaveBlob) { // For IE
    navigator.msSaveBlob(blob, filename);
  } else {
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.style.display = 'none';
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Execute the function
groupByDatetime();