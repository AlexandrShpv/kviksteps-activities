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
        
        // Initialize or update consolidated data for this datetime
        if (!consolidatedGroupData[datetimeKey]) {
          consolidatedGroupData[datetimeKey] = {
            user: new Set()
          };
          
          // Initialize a Set for each activity name
          activityNames.forEach(name => {
            consolidatedGroupData[datetimeKey][name] = new Set();
          });
        }
        
        // Add user if not empty
        if (user) consolidatedGroupData[datetimeKey].user.add(user);
        
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
    container.appendChild(table);
    
    // Create table header
    const thead = document.createElement('thead');
    table.appendChild(thead);
    
    const headerRow = document.createElement('tr');
    thead.appendChild(headerRow);
    
    // Build dynamic headers list
    const headers = ['Datetime', 'User', ...activityNames];
    
    headers.forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      th.style.backgroundColor = '#f0f0f0';
      th.style.padding = '8px';
      th.style.border = '1px solid #ddd';
      th.style.textAlign = 'left';
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
      
      // Create cell for datetime
      const datetimeCell = document.createElement('td');
      datetimeCell.textContent = formattedDatetime;
      datetimeCell.style.padding = '8px';
      datetimeCell.style.border = '1px solid #ddd';
      row.appendChild(datetimeCell);
      
      // Create cell for user
      const userCell = document.createElement('td');
      userCell.textContent = setToString(groupData.user);
      userCell.style.padding = '8px';
      userCell.style.border = '1px solid #ddd';
      row.appendChild(userCell);
      
      // Create cells for each activity name
      activityNames.forEach(activityName => {
        const cell = document.createElement('td');
        const activitySet = groupData[activityName];
        cell.textContent = activitySet ? setToString(activitySet) : '';
        cell.style.padding = '8px';
        cell.style.border = '1px solid #ddd';
        row.appendChild(cell);
      });
      
      rowCount++;
    });
    
    // Add export buttons
    addExportButtons(container, table);
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