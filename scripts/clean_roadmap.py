import os
import re

def clean_roadmap_mentions(directory):
    patterns = [
        (re.compile(r'v0\.5\.0 milestone', re.IGNORECASE), 'future milestone'),
        (re.compile(r'v0\.5\.0 Roadmap', re.IGNORECASE), 'future roadmap'),
        (re.compile(r'Planned Feature \(v0\.5\.0\)', re.IGNORECASE), 'Planned Feature'),
        (re.compile(r'v0\.5\.0\+', re.IGNORECASE), 'future releases'),
        (re.compile(r'target: v0\.5\.0', re.IGNORECASE), 'target: future'),
        (re.compile(r'planned for v0\.5\.0', re.IGNORECASE), 'planned for future releases'),
        (re.compile(r'v0\.5\.0\)', re.IGNORECASE), 'upcoming releases)'),
        # Specific cases for Correlator
        (re.compile(r'Planned Feature \({{VERS}}\)', re.IGNORECASE), 'Planned Feature'),
    ]

    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.md') or file.endswith('.yaml'):
                path = os.path.join(root, file)
                with open(path, 'r') as f:
                    content = f.read()
                
                new_content = content
                for pattern, replacement in patterns:
                    new_content = pattern.sub(replacement, new_content)
                
                if new_content != content:
                    print(f"Updating {path}")
                    with open(path, 'w') as f:
                        f.write(new_content)

if __name__ == "__main__":
    clean_roadmap_mentions('docs')
