#!/bin/bash

# Hardcode the script directory
script_dir="/Users/notAdmin/Dev/390-repo/Minicap.wiki/plantuml"
src_dir="$script_dir/src"

# Check if source directory exists
if [ ! -d "$src_dir" ]; then
    echo "Error: Source directory not found: $src_dir" >&2
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$script_dir/img"

# Find all .puml files and process them
find "$src_dir" -name "*.puml" -type f | while read file; do
    # Get the base name without extension and path
    base_name=$(basename "$file" .puml)
    
    # Generate PNG in the img directory
    plantuml -tpng -o "../img" "$file"
    
    echo "Processed: $file -> plantuml/img/$base_name.png"
done
