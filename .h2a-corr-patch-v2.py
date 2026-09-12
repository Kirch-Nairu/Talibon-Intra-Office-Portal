from pathlib import Path

path = Path('tests/Feature/CoreDocumentAttachmentsTest.php')
text = path.read_text()
old = "]) ->assertRedirect('/correspondence/'.$record->public_id.'/workspace');"
# Preserve register/classify/detail assertions; only the route request now returns to the authorized index.
needle = """        $this->actingAs($head)->post('/correspondence/'.$record->public_id.'/workspace/route', [
            'target_department_id' => $target->id,
            'priority' => 'normal',
            'evidence' => [UploadedFile::fake()->createWithContent(
                'routing.docx',
                \"PK\\x03\\x04[Content_Types].xml-word/document.xml-routing\",
            )],
        ])->assertRedirect('/correspondence/'.$record->public_id.'/workspace');
"""
replacement = """        $this->actingAs($head)->post('/correspondence/'.$record->public_id.'/workspace/route', [
            'target_department_id' => $target->id,
            'priority' => 'normal',
            'evidence' => [UploadedFile::fake()->createWithContent(
                'routing.docx',
                \"PK\\x03\\x04[Content_Types].xml-word/document.xml-routing\",
            )],
        ])->assertRedirect('/correspondence');
"""
if text.count(needle) != 1:
    raise SystemExit(f'expected one evidence route redirect assertion, found {text.count(needle)}')
path.write_text(text.replace(needle, replacement, 1))
