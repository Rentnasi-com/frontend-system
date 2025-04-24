import { Editor } from '@tinymce/tinymce-react';
import { useRef, useEffect } from 'react';

export default function RichTextEditor({ value, onChange, error }) {
    const editorRef = useRef(null);

    // Initialize with proper value
    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.getContent()) {
            editorRef.current.setContent(value || '');
        }
    }, [value]);

    return (
        <div className="mt-1">
            <Editor
                apiKey="your-tinymce-api-key" // Required for production
                onInit={(evt, editor) => {
                    editorRef.current = editor;
                    editor.setContent(value || '');
                }}
                init={{
                    height: 300,
                    menubar: false,
                    plugins: [
                        'advlist autolink lists link image charmap preview anchor',
                        'searchreplace visualblocks help wordcount'
                    ],
                    toolbar:
                        'undo redo | formatselect | bold italic | \
                        alignleft aligncenter alignright | \
                        bullist numlist outdent indent | help',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                    setup: (editor) => {
                        editor.on('blur', () => {
                            onChange(editor.getContent());
                        });
                    }
                }}
                onEditorChange={(content) => {
                    onChange(content);
                }}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600">
                    {typeof error === 'string' ? error : error.message}
                </p>
            )}
        </div>
    );
}