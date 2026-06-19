import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import api from '../services/api';
import PaperCard from '../components/ui/PaperCard';

export default function LetterDetail() {
  const { id } = useParams();
  const [letter, setLetter] = useState(null);

  useEffect(() => {
    api.get(`/letters/${id}`).then((r) => setLetter(r.data));
  }, [id]);

  if (!letter) return <p className="font-serif italic">Loading...</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/letters" className="mb-6 inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100">
        <ArrowLeft className="h-4 w-4" /> Back to future letters
      </Link>

      <PaperCard tape>
        <p className="flex items-center gap-2 text-xs tracking-widest text-[#b35a38]">
          <Mail className="h-3 w-3" /> A LETTER FROM YOUR PAST SELF
        </p>
        <h1 className="font-serif text-3xl font-bold">{letter.title || 'Untitled letter'}</h1>
        <p className="mt-1 text-sm opacity-60">Written on {new Date(letter.createdAt).toLocaleDateString()}</p>
        <p className="mt-6 whitespace-pre-wrap font-serif text-lg italic leading-relaxed">{letter.content}</p>
      </PaperCard>
    </div>
  );
}