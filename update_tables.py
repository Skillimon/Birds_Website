#!/usr/bin/env python3
"""
Script to update bird tables with migration status column
"""
import re

# Read the file
with open('bird_table_2024.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Birds to move from Garden to Countryside
birds_to_move = {
    'Jackdaw': {
        'latin': 'Corvus monedula',
        'status': 'LC',
        'lifespan': '3-4 years',
        'nest': 'Buildings, trees, cliffs',
        'period': 'April - July',
        'eggs': '3-6 eggs',
        'food': 'Omnivorous: insects, seeds, small animals',
        'migration': 'resident'
    },
    'Jay': {
        'latin': 'Garrulus glandarius',
        'status': 'LC',
        'lifespan': '5-7 years',
        'nest': 'Woodlands, parks, gardens',
        'period': 'March - July',
        'eggs': '4-6 eggs',
        'food': 'Insects, nuts, seeds, fruits, acorns',
        'migration': 'resident'
    },
    'Green Woodpecker': {
        'latin': 'Picus viridis',
        'status': 'LC',
        'lifespan': '3-7 years',
        'nest': 'Tree holes and old wood',
        'period': 'April - June',
        'eggs': '3-6 eggs',
        'food': 'Ants, insects',
        'migration': 'resident'
    },
    'Great Spotted Woodpecker': {
        'latin': 'Dendrocopos major',
        'status': 'LC',
        'lifespan': '3-4 years',
        'nest': 'Tree holes',
        'period': 'April - May',
        'eggs': '3-6 eggs',
        'food': 'Insects, seeds',
        'migration': 'resident'
    }
}

print("Script to update bird tables created.")
print("This will add migration status columns and move birds between tabs.")
