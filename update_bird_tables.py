#!/usr/bin/env python3
"""Update bird tables with migration status"""
import re

# Read the HTML file
with open('bird_table_2024.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

output_lines = []
in_garden_tab = False
in_countryside_tab = False
skip_bird = False
skip_count = 0

# Birds to remove from Garden and add to Countryside
birds_to_move = ['Jackdaw', 'Jay', 'Green Woodpecker', 'Great Spotted Woodpecker']

for i, line in enumerate(lines):
    # Track which tab we're in
    if 'id="garden-tab"' in line:
        in_garden_tab = True
        in_countryside_tab = False
    elif 'id="countryside-tab"' in line:
        in_garden_tab = False
        in_countryside_tab = True
    elif 'id="water-tab"' in line or 'id="seabirds-tab"' in line or 'id="raptors-tab"' in line:
        in_garden_tab = False
        in_countryside_tab = False
    
    # Add Migration header to all table headers
    if '<th>Status</th>' in line and i + 1 < len(lines) and '<th>Lifespan</th>' in lines[i+1]:
        output_lines.append(line)
        output_lines.append('        <th>Migration</th>\n')
        continue
    elif '<th>Lifespan</th>' in line and i > 0 and '<th>Status</th>' in lines[i-1]:
        # Skip this line as we already added Migration before it
        continue
    
    # Handle bird rows - add migration column
    if '<td><span class="status-badge' in line:
        output_lines.append(line)
        # Check next line for bird name to determine migration status
        if i + 1 < len(lines):
            next_line = lines[i + 1]
            if 'Redwing' in next_line:
                output_lines.append('        <td><span class="migration-dot winter"></span></td>\n')
            elif 'Common Tern' in next_line:
                output_lines.append('        <td><span class="migration-dot summer"></span></td>\n')
            else:
                output_lines.append('        <td><span class="migration-dot resident"></span></td>\n')
        continue
    
    # Skip birds to move from Garden tab
    if in_garden_tab and any(bird in line for bird in birds_to_move) and '<td>' in line:
        skip_bird = True
        skip_count = 0
    
    if skip_bird:
        skip_count += 1
        if '</tr>' in line:
            skip_bird = False
        continue
    
    output_lines.append(line)

# Write back
with open('bird_table_2024.html', 'w', encoding='utf-8') as f:
    f.writelines(output_lines)

print("Updated bird tables with migration column")
