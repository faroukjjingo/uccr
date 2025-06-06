// src/components/Case/CaseDetail.jsx
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { addReaction } from '../../firebase/firestore';
import { Award } from 'lucide-react';
import CommentSection from './CommentSection';
import styles from '../../styles/caseDetail.module.css';

// Utility function to process text with line breaks and paragraphs
const formatText = (text) => {
  if (!text || typeof text !== 'string') return <p>Not specified</p>;
  // Split on double newlines for paragraphs
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  return paragraphs.map((paragraph, index) => (
    <p key={index} className={styles.paragraph}>
      {paragraph.split('\n').map((line, i, arr) =>
        i < arr.length - 1 ? (
          <span key={i}>
            {line}
            <br />
          </span>
        ) : (
          line
        )
      )}
    </p>
  ));
};

export default function CaseDetail({ caseData }) {
  const { user } = useAuth();
  const [error, setError] = useState('');

  console.log('CaseDetail caseData:', caseData);

  const handleVote = async (type) => {
    if (!user) {
      setError('You must be logged in to vote.');
      return;
    }
    try {
      await addReaction(caseData.id, user.uid, type);
      setError('');
    } catch (err) {
      setError('Failed to record vote. Please try again.');
    }
  };

  return (
    <article className={styles.caseDetail}>
      <header className={styles.header}>
        <h1 className={styles.title}>{caseData.title || 'Untitled Case'}</h1>
        <div className={styles.meta}>
          <div className={styles.author}>
            <Link href={`/profile/view/${caseData.userId}`}>
              <Image
                src={caseData.photoURL || '/images/doctor-avatar.jpeg'}
                alt={caseData.userName || 'Contributor'}
                width={40}
                height={40}
                className={styles.avatar}
                onError={(e) => console.error('Author image error:', caseData.photoURL)}
              />
            </Link>
            <Link href={`/profile/view/${caseData.userId}`}>
              <span className={styles.authorName}>{caseData.userName || 'Anonymous'}</span>
            </Link>
          </div>
          <time className={styles.date}>
            {caseData.createdAt
              ? new Date(caseData.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'Unknown date'}
          </time>
        </div>
      </header>

      <div className={styles.voteSection}>
        <button
          onClick={() => handleVote('award')}
          className={styles.voteButton}
          disabled={!user}
          aria-label="Award case"
        >
          <Award size={20} />
          <span className={styles.voteCount}>{caseData.awards || 0}</span>
        </button>
        {error && <p className={styles.error}>{error}</p>}
      </div>

      <section className={styles.content}>
        <div className={styles.section}>
          <h2>Chief Concern</h2>
          {formatText(caseData.presentingComplaint)}
        </div>
        <div className={styles.section}>
          <h2>Specialty</h2>
          <p>{caseData.specialty || 'Not specified'}</p>
        </div>
        <div className={styles.section}>
          <h2>History</h2>
          {formatText(caseData.history)}
        </div>
        <div className={styles.section}>
          <h2>Investigations</h2>
          {formatText(caseData.investigations)}
        </div>
        <div className={styles.section}>
          <h2>Management</h2>
          {formatText(caseData.management)}
        </div>
        <div className={styles.section}>
          <h2>Provisional Diagnosis</h2>
          <p>{caseData.provisionalDiagnosis || 'Not specified'}</p>
        </div>
        <div className={styles.section}>
          <h2>Hospital</h2>
          <p>{caseData.hospital || 'Not specified'}</p>
        </div>
        <div className={styles.section}>
          <h2>Referral Center</h2>
          <p>{caseData.referralCenter || 'Not specified'}</p>
        </div>
        <div className={styles.section}>
          <h2>Discussion</h2>
          {formatText(caseData.discussion)}
        </div>
      </section>

      {Array.isArray(caseData.mediaUrls) && caseData.mediaUrls.length > 0 ? (
        <section className={styles.media}>
          <h2>Media</h2>
          <div className={styles.mediaGrid}>
            {caseData.mediaUrls.map((url, index) => (
              url ? (
                <Image
                  key={index}
                  src={url}
                  alt={`Case media ${index + 1}`}
                  width={600}
                  height={400}
                  className={styles.mediaImage}
                  objectFit="contain"
                  onError={(e) => console.error('Media image error:', url)}
                />
              ) : (
                <div key={index} className={styles.mediaImage}>
                  <Image
                    src="/images/placeholder-case.jpg"
                    alt="No media available"
                    width={600}
                    height={400}
                    objectFit="contain"
                  />
                </div>
              )
            ))}
          </div>
        </section>
      ) : (
        <section className={styles.media}>
          <h2>Media</h2>
          <p>No media available.</p>
        </section>
      )}

      <CommentSection caseId={caseData.id} />
    </article>
  );
}