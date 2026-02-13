import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  try {
    const { file } = await params;

    // Map file identifiers to public directory paths
    const fileMap: { [key: string]: string } = {
      'togal-readme': 'togal-readme.md',
      'togal-initial-research': 'togal-initial-research.md',
      'patrick-murphy-analysis': 'patrick-murphy-analysis.md',
      'patrick-murphy-transcript': 'patrick-murphy-transcript.txt',
    };

    const filename = fileMap[file];
    if (!filename) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Read from public/research directory
    const filePath = path.join(process.cwd(), 'public', 'research', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found on filesystem' },
        { status: 404 }
      );
    }

    // Read and return the file content
    let content = fs.readFileSync(filePath, 'utf-8');

    // Format transcript with line breaks after each timestamp segment
    if (filename === 'patrick-murphy-transcript.txt') {
      // Add double line breaks after each timestamp line for better readability
      content = content
        .split('\n')
        .map((line) => {
          // If line starts with timestamp, add line break after it
          if (line.match(/^\[\d{2}:\d{2}\]/)) {
            return line + '\n';
          }
          return line;
        })
        .join('\n');
    }

    return NextResponse.json({
      content,
      filename,
    });
  } catch (error) {
    console.error('Error reading research file:', error);
    return NextResponse.json(
      { error: 'Failed to read file' },
      { status: 500 }
    );
  }
}
