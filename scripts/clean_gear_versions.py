import os
import re

def clean_gear_tables(directory):
    # Matches '| **Status** | Stable (v0.x.y) |' or '| **Status** | Stable ({{VERS}}) |'
    status_pattern = re.compile(r'(\| \*\*Status\*\* \|) (Stable|Planned|Preview) \((v?\d+\.\d+\.\d+\+?|{{VERS}})\)', re.IGNORECASE)
    # Also catch '| **Status** | Stable |' with no version but needing consistency check if needed
    # But mainly we want to remove the (vX.X.X) part.
    
    # Roadmap warning pattern removal of version
    roadmap_warning_pattern = re.compile(r'\*\*Planned Feature \(v?\d+\.\d+\.\d+\+?\)\*\*', re.IGNORECASE)

    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.md'):
                path = os.path.join(root, file)
                with open(path, 'r') as f:
                    content = f.read()
                
                # 1. Clean status tables
                new_content = status_pattern.sub(r'\1 \2', content)
                
                # 2. Clean roadmap warnings (Planned Feature (vX.X.X) -> Planned Feature)
                new_content = roadmap_warning_pattern.sub('**Planned Feature**', new_content)

                if new_content != content:
                    print(f"Cleaning versions in {path}")
                    with open(path, 'w') as f:
                        f.write(new_content)

if __name__ == "__main__":
    clean_gear_tables('docs/reference/gears')
