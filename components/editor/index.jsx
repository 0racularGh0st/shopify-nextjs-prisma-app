import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css'; // Import styles
// Dynamically import React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const RichTextEditor = (props) => {
  const { initialHtml, setHtml } = props;
  const quillRef = useRef(null);
  const [editorHtml, setEditorHtml] = useState(initialHtml); // Initial content can be empty or a string
  
  useEffect(() => {
    console.log("Initial  ->>", initialHtml);
    setEditorHtml(initialHtml);
  }, [initialHtml])

  useEffect(() => {
    setHtml(editorHtml);
  }, [editorHtml]);

  const handleSave = () => {
      console.log(editorHtml); // Log the content with inline styles applied
  };


  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
    ],
    clipboard: {
      // Toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    }
  };

  const formats = [
    'bold', 'italic', 'underline'
  ];

  return (
    <div>
      <ReactQuill
        ref={quillRef}
        value={editorHtml}
        onChange={setEditorHtml}
        modules={modules}
        formats={formats}
        // style={{ height: '170px', maxHeight: '170px', overflowY: 'auto' }} // Set the editor height and max height
      />
      {/* <button onClick={handleSave}>Save</button> */}
    </div>
  );
};

export default RichTextEditor;