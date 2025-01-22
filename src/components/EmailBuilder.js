import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css';

const EmailBuilder = () => {
    const [layout, setLayout] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    // Fetch email layout on component mount
    useEffect(() => {
        const fetchLayout = async () => {
            try {
                const response = await axios.get('/layout.html');
                setLayout(response.data);
            } catch (error) {
                console.error('Error fetching layout:', error);
            }
        };
        fetchLayout();
    }, []);

    // Handle image upload and get the URL
    const handleImageUpload = async (e) => {
        const formData = new FormData();
        formData.append('image', e.target.files[0]);

        try {
            const response = await axios.post('https://vercel.com/rutuja-mahales-projects/email-backend/api/email/uploadImage', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setImageUrl(response.data.url);  // This is the image URL returned from the server
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    // Save email template
    const handleSaveTemplate = async () => {
        const templateData = { title, content, imageUrl };

        if (!title || !content || !imageUrl) {
            alert('Please fill in all fields and upload an image.');
            return;
        }

        try {
            const response = await axios.post('https://vercel.com/rutuja-mahales-projects/email-backend/api/email/emailConfig', templateData);
            alert('Template saved successfully!');
        } catch (error) {
            console.error('Error saving template:', error);
            alert('Error saving template');
        }
    };

    // Handle template download
    const handleDownloadTemplate = async () => {
        const templateData = { title, content, imageUrl };

        try {
            const response = await axios.post('https://vercel.com/rutuja-mahales-projects/email-backend/api/email/download', templateData, {
                responseType: 'text',  // Ensure response type is 'text' for downloading HTML
            });

            // Create a download link for the received file (HTML content)
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/html' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'email-template.html');
            document.body.appendChild(link);
            link.click();

            // Clean up the link after download
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading template:', error.response ? error.response.data : error.message);
            alert('Error downloading template. Check the console for more details.');
        }
    };

    return (
        <div className="email-builder">
            <h1>Email Builder</h1>
            <div className="form-group">
                <label>Title:</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="form-group">
                <label>Content:</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} />
            </div>
            <div className="form-group">
                <label>Upload Image:</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
            </div>
            {imageUrl && <img src={imageUrl} alt="Uploaded" style={{ width: '100px' }} />}
            <div className="form-group">
                <button onClick={handleSaveTemplate}>Save Template</button>
                <button onClick={handleDownloadTemplate}>Download Template</button>
            </div>
            <div className="preview">
                <h2>Preview</h2>
                <div
                    dangerouslySetInnerHTML={{
                        __html: layout
                            .replace('{{title}}', title)
                            .replace('{{content}}', content)
                            .replace('{{imageUrl}}', imageUrl),  // Inject the image URL correctly
                    }}
                />
            </div>
        </div>
    );
};

export default EmailBuilder;
