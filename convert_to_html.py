import markdown
import os

input_file = "PROJECT_REPORT.md"
output_file = "Coffee_Shop_Recommender_System_Report.html"

with open(input_file, "r", encoding="utf-8") as f:
    md_content = f.read()

html_body = markdown.markdown(md_content, extensions=["tables", "fenced_code", "toc"])

html_doc = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Coffee Shop Recommender System - Full Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  
  body {{
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.7;
    color: #1a1a2e;
    background: #fff;
    padding: 40px 60px;
    max-width: 900px;
    margin: 0 auto;
    font-size: 14px;
  }}

  h1 {{
    font-size: 2em;
    font-weight: 800;
    color: #0a0a12;
    margin: 1.2em 0 0.4em;
    border-bottom: 3px solid #d4a056;
    padding-bottom: 8px;
  }}

  h2 {{
    font-size: 1.5em;
    font-weight: 700;
    color: #16213e;
    margin: 1.4em 0 0.5em;
    border-bottom: 2px solid #e8d5b7;
    padding-bottom: 6px;
  }}

  h3 {{
    font-size: 1.2em;
    font-weight: 700;
    color: #1a1a2e;
    margin: 1.2em 0 0.3em;
  }}

  h4 {{
    font-size: 1.05em;
    font-weight: 600;
    color: #333;
    margin: 1em 0 0.3em;
  }}

  p {{
    margin: 0.6em 0;
  }}

  code {{
    font-family: 'Fira Code', 'Consolas', monospace;
    background: #f0ebe3;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
    color: #7a4f1c;
  }}

  pre {{
    background: #0a0a12;
    color: #e8d5b7;
    padding: 18px 22px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1em 0;
    font-size: 0.85em;
    line-height: 1.6;
    border-left: 4px solid #d4a056;
  }}

  pre code {{
    background: none;
    color: inherit;
    padding: 0;
  }}

  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
    font-size: 0.9em;
  }}

  th {{
    background: #16213e;
    color: #fff;
    padding: 10px 14px;
    text-align: left;
    font-weight: 600;
  }}

  td {{
    padding: 8px 14px;
    border-bottom: 1px solid #e0d6c8;
  }}

  tr:nth-child(even) {{
    background: #faf5ef;
  }}

  blockquote {{
    border-left: 4px solid #d4a056;
    background: #faf5ef;
    padding: 12px 20px;
    margin: 1em 0;
    border-radius: 0 6px 6px 0;
    color: #5a4a32;
    font-style: italic;
  }}

  ul, ol {{
    margin: 0.5em 0;
    padding-left: 28px;
  }}

  li {{
    margin: 0.3em 0;
  }}

  hr {{
    border: none;
    border-top: 2px solid #e0d6c8;
    margin: 2em 0;
  }}

  a {{
    color: #b8860b;
    text-decoration: none;
  }}

  strong {{
    color: #0a0a12;
  }}

  /* Cover styling */
  div[align="center"] h1 {{
    border-bottom: none;
    font-size: 2.4em;
    color: #d4a056;
  }}

  div[align="center"] h3 {{
    color: #666;
    font-weight: 400;
  }}

  @media print {{
    body {{
      padding: 20px 40px;
      font-size: 12px;
    }}
    pre {{
      white-space: pre-wrap;
      word-wrap: break-word;
    }}
    h1, h2 {{
      page-break-after: avoid;
    }}
    table, pre {{
      page-break-inside: avoid;
    }}
  }}
</style>
</head>
<body>
{html_body}
</body>
</html>
"""

with open(output_file, "w", encoding="utf-8") as f:
    f.write(html_doc)

print(f"Generated: {output_file}")
print(f"Size: {os.path.getsize(output_file) / 1024:.1f} KB")
print("Open this HTML file in your browser and use Ctrl+P to save as PDF.")
