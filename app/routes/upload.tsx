import {type FormEvent, useState} from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";

const Upload = () => {
    // Resume upload and NLP analysis component
    const { isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File  }) => {
        setIsProcessing(true);

        try {
            setStatusText('Uploading the file...');
            const uploadedFile = await fs.upload([file]);
            if(!uploadedFile) {
                setStatusText('Error: Failed to upload file');
                setIsProcessing(false);
                return;
            }
            console.log('Uploaded file:', uploadedFile);

            setStatusText('Converting PDF to image...');
            const imageFile = await convertPdfToImage(file);
            if(!imageFile.file) {
                setStatusText(`Error: ${imageFile.error || 'Failed to convert PDF to image'}`);
                setIsProcessing(false);
                return;
            }
            console.log('Converted to image successfully');

            setStatusText('Uploading the image...');
            const uploadedImage = await fs.upload([imageFile.file]);
            if(!uploadedImage) {
                setStatusText('Error: Failed to upload image');
                setIsProcessing(false);
                return;
            }
            console.log('Uploaded image:', uploadedImage);

            setStatusText('Preparing data...');
            const uuid = generateUUID();
            const data = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName, 
                jobTitle, 
                jobDescription,
                feedback: '',
            }
            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            console.log('Data saved with UUID:', uuid);

            setStatusText('Analyzing with AI...');

            const feedback = await ai.feedback(
                uploadedFile.path,
                prepareInstructions({ jobTitle, jobDescription })
            );
            
            if (!feedback) {
                setStatusText('Error: Failed to get AI response');
                setIsProcessing(false);
                return;
            }

            console.log('AI Response:', feedback);

            // Extract text from AI response
            let feedbackText = '';
            if (typeof feedback.message.content === 'string') {
                feedbackText = feedback.message.content;
            } else if (Array.isArray(feedback.message.content)) {
                const textContent = feedback.message.content.find((c: any) => c.text);
                feedbackText = textContent?.text || '';
            }

            if (!feedbackText) {
                setStatusText('Error: Empty response from AI');
                setIsProcessing(false);
                return;
            }

            console.log('Feedback Text:', feedbackText);

            // Clean the feedback text (remove markdown code blocks if present)
            const cleanedText = feedbackText
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();

            // Parse JSON
            let parsedFeedback;
            try {
                parsedFeedback = JSON.parse(cleanedText);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.error('Attempted to parse:', cleanedText);
                setStatusText('Error: Invalid AI response format');
                setIsProcessing(false);
                return;
            }

            data.feedback = parsedFeedback;
            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            
            setStatusText('Analysis complete! Redirecting...');
            console.log('Final Data:', data);
            
            setTimeout(() => {
                navigate(`/resume/${uuid}`);
            }, 1000);
        } catch (error) {
            console.error('Analysis Error:', error);
            setStatusText(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setIsProcessing(false);
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" />
                        </>
                    ) : (
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )}
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button className="primary-button" type="submit">
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    )
}
export default Upload
