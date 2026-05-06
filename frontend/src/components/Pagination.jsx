export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button onClick={() => onChange(page - 1)} disabled={page === 1} className="px-3 py-1.5 rounded border text-sm disabled:opacity-40 hover:bg-gray-100">
        &laquo;
      </button>
      {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
        let p;
        if (pages <= 7) p = i + 1;
        else if (page <= 4) p = i + 1;
        else if (page >= pages - 3) p = pages - 6 + i;
        else p = page - 3 + i;
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`px-3 py-1.5 rounded border text-sm ${p === page ? 'bg-primary text-white border-primary' : 'hover:bg-gray-100'}`}
          >
            {p}
          </button>
        );
      })}
      <button onClick={() => onChange(page + 1)} disabled={page === pages} className="px-3 py-1.5 rounded border text-sm disabled:opacity-40 hover:bg-gray-100">
        &raquo;
      </button>
    </div>
  );
}
