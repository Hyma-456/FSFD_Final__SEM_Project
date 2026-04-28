-- ========================================
-- Seed Data for ResearchCollab Platform
-- ========================================

USE researchcollab;

-- Clear existing data (in correct order for foreign keys)
DELETE FROM enrollments;
DELETE FROM project_members;
DELETE FROM milestones;
DELETE FROM messages;
DELETE FROM documents;
DELETE FROM projects;
DELETE FROM courses;
DELETE FROM users;

-- ========================================
-- USERS (password: password123)
-- ========================================
INSERT INTO users (id, name, email, password, role) VALUES
(1, 'Dr. Hyma Kumar', 'hyma@university.edu', 'password123', 'ADMIN'),
(2, 'Dr. Sarah Chen', 'sarah.chen@university.edu', 'password123', 'RESEARCHER'),
(3, 'Dr. Rajesh Patel', 'rajesh.patel@university.edu', 'password123', 'RESEARCHER'),
(4, 'Ananya Sharma', 'ananya.sharma@university.edu', 'password123', 'STUDENT'),
(5, 'Michael Johnson', 'michael.j@university.edu', 'password123', 'STUDENT'),
(6, 'Priya Reddy', 'priya.reddy@university.edu', 'password123', 'STUDENT'),
(7, 'Dr. Emily Watson', 'emily.watson@university.edu', 'password123', 'RESEARCHER'),
(8, 'Arjun Nair', 'arjun.nair@university.edu', 'password123', 'STUDENT'),
(9, 'Sofia Martinez', 'sofia.m@university.edu', 'password123', 'STUDENT'),
(10, 'Dr. David Lee', 'david.lee@university.edu', 'password123', 'RESEARCHER');

-- ========================================
-- PROJECTS
-- ========================================
INSERT INTO projects (id, name, description, status, progress, members, `lead`) VALUES
(1, 'AI-Powered Drug Discovery', 'Using deep learning models to identify potential drug candidates for rare diseases. Involves molecular docking simulations and QSAR modeling.', 'Active', 75, 5, 'Dr. Sarah Chen'),
(2, 'Quantum Computing Optimization', 'Exploring quantum algorithms for solving NP-hard optimization problems in logistics and supply chain management.', 'Active', 45, 4, 'Dr. Rajesh Patel'),
(3, 'Climate Change Impact Analysis', 'Analyzing satellite imagery and weather data to predict the impact of climate change on agricultural yield in South Asia.', 'Active', 60, 6, 'Dr. Emily Watson'),
(4, 'Natural Language Processing for Healthcare', 'Developing NLP models to extract clinical insights from unstructured medical records and research papers.', 'Completed', 100, 3, 'Dr. Sarah Chen'),
(5, 'Blockchain in Academic Publishing', 'Designing a decentralized peer-review system using blockchain technology to improve transparency in academic publishing.', 'On Hold', 30, 3, 'Dr. David Lee'),
(6, 'IoT Smart Campus', 'Building an IoT-based smart campus system for energy monitoring, classroom scheduling, and facility management.', 'Active', 55, 5, 'Dr. Rajesh Patel'),
(7, 'Cybersecurity Threat Detection', 'Machine learning-based intrusion detection system for identifying zero-day attacks in university network infrastructure.', 'Active', 40, 4, 'Dr. David Lee'),
(8, 'Augmented Reality in Education', 'Developing AR-based learning modules for STEM education to enhance student engagement and understanding.', 'Planning', 10, 2, 'Dr. Emily Watson');

-- ========================================
-- COURSES
-- ========================================
INSERT INTO courses (id, name, description, credits, instructor) VALUES
(1, 'Advanced Machine Learning', 'Deep dive into neural networks, reinforcement learning, GANs, and transformer architectures with hands-on projects.', 4, 'Dr. Sarah Chen'),
(2, 'Quantum Computing Fundamentals', 'Introduction to quantum mechanics principles, qubit operations, quantum gates, and basic quantum algorithms.', 3, 'Dr. Rajesh Patel'),
(3, 'Data Science & Big Data Analytics', 'Statistical analysis, data visualization, Hadoop/Spark ecosystem, and real-world data pipeline design.', 4, 'Dr. Emily Watson'),
(4, 'Cloud Computing & DevOps', 'AWS/Azure services, containerization with Docker/Kubernetes, CI/CD pipelines, and infrastructure as code.', 3, 'Dr. David Lee'),
(5, 'Cybersecurity & Ethical Hacking', 'Network security, penetration testing, cryptography, and security compliance frameworks.', 3, 'Dr. David Lee'),
(6, 'Full Stack Web Development', 'Modern web development with React, Spring Boot, REST APIs, databases, and deployment strategies.', 4, 'Dr. Hyma Kumar'),
(7, 'Research Methodology', 'Scientific research methods, literature review techniques, experimental design, and academic writing.', 2, 'Dr. Sarah Chen'),
(8, 'Internet of Things', 'Sensor networks, embedded systems programming, MQTT protocol, and IoT cloud platforms.', 3, 'Dr. Rajesh Patel');

-- ========================================
-- DOCUMENTS
-- ========================================
INSERT INTO documents (id, name, type, size, date, project, content) VALUES
(1, 'Drug Discovery - Literature Review.pdf', 'PDF', '2.4 MB', '2026-04-15', 'AI-Powered Drug Discovery', 'Comprehensive review of existing drug discovery approaches using AI and machine learning techniques.'),
(2, 'Quantum Algorithms Report.docx', 'DOCX', '1.8 MB', '2026-04-10', 'Quantum Computing Optimization', 'Analysis of quantum computing algorithms including Grover and Shor algorithms for optimization.'),
(3, 'Climate Data Analysis Results.xlsx', 'XLSX', '5.2 MB', '2026-04-12', 'Climate Change Impact Analysis', 'Satellite imagery analysis results and agricultural yield prediction data for 2020-2025.'),
(4, 'NLP Model Architecture.pdf', 'PDF', '3.1 MB', '2026-03-28', 'Natural Language Processing for Healthcare', 'Technical architecture document for the clinical NLP model using BERT and GPT variants.'),
(5, 'Blockchain Whitepaper Draft.pdf', 'PDF', '1.5 MB', '2026-04-01', 'Blockchain in Academic Publishing', 'Draft whitepaper outlining the decentralized peer-review system architecture.'),
(6, 'IoT Sensor Specifications.pdf', 'PDF', '890 KB', '2026-04-20', 'IoT Smart Campus', 'Technical specifications for IoT sensors deployed across campus buildings.'),
(7, 'Threat Detection ML Model.ipynb', 'IPYNB', '4.7 MB', '2026-04-18', 'Cybersecurity Threat Detection', 'Jupyter notebook with trained ML models for network intrusion detection.'),
(8, 'AR Module Prototype.pdf', 'PDF', '2.1 MB', '2026-04-22', 'Augmented Reality in Education', 'Prototype design document for AR-based chemistry lab simulations.'),
(9, 'Project Progress Report Q1.pdf', 'PDF', '1.2 MB', '2026-03-31', 'AI-Powered Drug Discovery', 'Quarterly progress report summarizing milestones achieved and next steps.'),
(10, 'Research Ethics Approval.pdf', 'PDF', '340 KB', '2026-02-15', 'Natural Language Processing for Healthcare', 'IRB approval document for accessing de-identified medical records.');

-- ========================================
-- MESSAGES
-- ========================================
INSERT INTO messages (id, sender, message, time, project, type, status) VALUES
(1, 'Dr. Sarah Chen', 'Team, the new drug candidate screening results are promising. Lets schedule a review meeting this week.', '10:30 AM', 'AI-Powered Drug Discovery', 'team', 'unread'),
(2, 'Ananya Sharma', 'I have completed the data preprocessing pipeline for the molecular dataset. Ready for review.', '11:15 AM', 'AI-Powered Drug Discovery', 'team', 'read'),
(3, 'Dr. Rajesh Patel', 'The quantum circuit simulation is showing 40% improvement over classical approaches.', '09:45 AM', 'Quantum Computing Optimization', 'team', 'unread'),
(4, 'Michael Johnson', 'Can someone review my pull request for the climate data visualization module?', '02:30 PM', 'Climate Change Impact Analysis', 'team', 'read'),
(5, 'Dr. Emily Watson', 'Important: Conference paper submission deadline extended to May 15th.', '08:00 AM', 'Climate Change Impact Analysis', 'announcement', 'unread'),
(6, 'Priya Reddy', 'I found an interesting paper on transformer-based NLP for clinical text. Sharing the link.', '03:45 PM', 'Natural Language Processing for Healthcare', 'team', 'read'),
(7, 'Dr. David Lee', 'The blockchain testnet is now deployed. Everyone can start testing smart contracts.', '04:00 PM', 'Blockchain in Academic Publishing', 'announcement', 'unread'),
(8, 'Arjun Nair', 'IoT sensor data collection script is ready. Running initial tests on Building A.', '01:20 PM', 'IoT Smart Campus', 'team', 'read'),
(9, 'Sofia Martinez', 'Cybersecurity lab exercise submissions are due by Friday. Please upload to the portal.', '05:00 PM', 'Cybersecurity Threat Detection', 'reminder', 'unread'),
(10, 'Dr. Hyma Kumar', 'Welcome to the new semester! All project teams please update your milestones by next Monday.', '09:00 AM', 'General', 'announcement', 'unread');

-- ========================================
-- MILESTONES
-- ========================================
INSERT INTO milestones (id, name, done, project_id) VALUES
(1, 'Literature Review Complete', 1, 1),
(2, 'Dataset Collection & Cleaning', 1, 1),
(3, 'Model Training Phase 1', 1, 1),
(4, 'Drug Candidate Screening', 0, 1),
(5, 'Final Report & Publication', 0, 1),
(6, 'Quantum Circuit Design', 1, 2),
(7, 'Simulation Framework Setup', 1, 2),
(8, 'Benchmark Testing', 0, 2),
(9, 'Performance Analysis Report', 0, 2),
(10, 'Satellite Data Acquisition', 1, 3),
(11, 'Data Preprocessing Pipeline', 1, 3),
(12, 'Predictive Model Development', 1, 3),
(13, 'Regional Impact Assessment', 0, 3),
(14, 'Policy Recommendation Report', 0, 3),
(15, 'Sensor Deployment Phase 1', 1, 6),
(16, 'Data Dashboard Development', 0, 6),
(17, 'Energy Optimization Algorithm', 0, 6),
(18, 'Network Traffic Analysis', 1, 7),
(19, 'ML Model Training', 0, 7),
(20, 'Real-time Detection System', 0, 7);

-- ========================================
-- PROJECT MEMBERS
-- ========================================
INSERT INTO project_members (id, project_id, user_id, role) VALUES
(1, 1, 2, 'Lead Researcher'),
(2, 1, 4, 'Research Assistant'),
(3, 1, 5, 'Research Assistant'),
(4, 1, 6, 'Data Analyst'),
(5, 1, 8, 'Research Assistant'),
(6, 2, 3, 'Lead Researcher'),
(7, 2, 5, 'Research Assistant'),
(8, 2, 9, 'Research Assistant'),
(9, 2, 8, 'Data Analyst'),
(10, 3, 7, 'Lead Researcher'),
(11, 3, 4, 'Research Assistant'),
(12, 3, 6, 'Data Analyst'),
(13, 3, 9, 'Research Assistant'),
(14, 3, 5, 'Research Assistant'),
(15, 3, 3, 'Co-Investigator'),
(16, 4, 2, 'Lead Researcher'),
(17, 4, 6, 'Research Assistant'),
(18, 4, 4, 'Data Analyst'),
(19, 5, 10, 'Lead Researcher'),
(20, 5, 8, 'Research Assistant'),
(21, 5, 9, 'Research Assistant'),
(22, 6, 3, 'Lead Researcher'),
(23, 6, 8, 'Research Assistant'),
(24, 6, 5, 'Hardware Engineer'),
(25, 6, 4, 'Data Analyst'),
(26, 6, 9, 'Research Assistant'),
(27, 7, 10, 'Lead Researcher'),
(28, 7, 5, 'Research Assistant'),
(29, 7, 9, 'Security Analyst'),
(30, 7, 6, 'Data Analyst'),
(31, 8, 7, 'Lead Researcher'),
(32, 8, 4, 'Research Assistant');

-- ========================================
-- ENROLLMENTS
-- ========================================
INSERT INTO enrollments (id, user_id, course_id, enrolled_date) VALUES
(1, 4, 1, '2026-01-15'),
(2, 4, 3, '2026-01-15'),
(3, 4, 6, '2026-01-16'),
(4, 5, 1, '2026-01-15'),
(5, 5, 2, '2026-01-15'),
(6, 5, 5, '2026-01-17'),
(7, 6, 3, '2026-01-15'),
(8, 6, 6, '2026-01-16'),
(9, 6, 7, '2026-01-15'),
(10, 8, 2, '2026-01-15'),
(11, 8, 4, '2026-01-16'),
(12, 8, 8, '2026-01-17'),
(13, 9, 1, '2026-01-15'),
(14, 9, 5, '2026-01-16'),
(15, 9, 6, '2026-01-15');

SELECT 'Seed data loaded successfully!' AS Status;
