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
  
  // Function to extract field data from the changelog
  function extractFieldData(block, fieldName) {
    // First try to find activity-name that matches the field
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
    
    // Create a map to group blocks by exact datetime
    const datetimeGroups = {};
    
    // Also store consolidated information for each datetime group
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
        
        // Extract details from this block
        const user = extractUser(block);
        const papildusAtbildigais = extractFieldData(block, 'Papildus atbildīgais');
        const regions = extractFieldData(block, 'Reģions_nodaļa_OIB');
        const currentAtbild = extractFieldData(block, 'Current_atbild');
        const statusaTermins = extractFieldData(block, 'Statusa izpildes termiņš');
        const sasaistit = extractFieldData(block, 'Sasaistīt');
        const saskanojusi = extractFieldData(block, 'Saskaņojuši');
        const atbildigais = extractFieldData(block, 'Atbildīgais');
        const status = extractFieldData(block, 'Statuss');
        
        // Initialize or update consolidated data for this datetime
        if (!consolidatedGroupData[datetimeKey]) {
          consolidatedGroupData[datetimeKey] = {
            user: new Set(),
            papildusAtbildigais: new Set(),
            regions: new Set(),
            currentAtbild: new Set(),
            statusaTermins: new Set(),
            sasaistit: new Set(),
            saskanojusi: new Set(),
            atbildigais: new Set(),
            status: new Set()
          };
        }
        
        // Add non-empty values to the sets
        if (user) consolidatedGroupData[datetimeKey].user.add(user);
        if (papildusAtbildigais) consolidatedGroupData[datetimeKey].papildusAtbildigais.add(papildusAtbildigais);
        if (regions) consolidatedGroupData[datetimeKey].regions.add(regions);
        if (currentAtbild) consolidatedGroupData[datetimeKey].currentAtbild.add(currentAtbild);
        if (statusaTermins) consolidatedGroupData[datetimeKey].statusaTermins.add(statusaTermins);
        if (sasaistit) consolidatedGroupData[datetimeKey].sasaistit.add(sasaistit);
        if (saskanojusi) consolidatedGroupData[datetimeKey].saskanojusi.add(saskanojusi);
        if (atbildigais) consolidatedGroupData[datetimeKey].atbildigais.add(atbildigais);
        if (status) consolidatedGroupData[datetimeKey].status.add(status);
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
    createDetailedSummaryTable(datetimeGroups, consolidatedGroupData);
    
    return `Grouped ${issueBlocks.length} items into ${Object.keys(datetimeGroups).length} datetime groups with alternating backgrounds`;
  }
  
  // Function to create a detailed summary table
  function createDetailedSummaryTable(datetimeGroups, consolidatedGroupData) {
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
    
    const headers = [
      'Datetime', 
      'User', 
      'Papildus atbildīgais', 
      'Reģions_nodaļa_OIB', 
      'Current_atbild', 
      'Statusa izpildes termiņš', 
      'Sasaistīt', 
      'Saskaņojuši', 
      'Atbildīgais', 
      'Statuss'
    ];
    
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
      
      // Create cells for each column
      [
        formattedDatetime,
        setToString(groupData.user),
        setToString(groupData.papildusAtbildigais),
        setToString(groupData.regions),
        setToString(groupData.currentAtbild),
        setToString(groupData.statusaTermins),
        setToString(groupData.sasaistit),
        setToString(groupData.saskanojusi),
        setToString(groupData.atbildigais),
        setToString(groupData.status)
      ].forEach(value => {
        const cell = document.createElement('td');
        cell.textContent = value || '';
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