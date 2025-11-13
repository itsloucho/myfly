export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-gray-600 mb-4">This feature is coming soon</p>
        <div 
          className="inline-flex px-4 py-2 rounded-lg"
          style={{ 
            background: 'linear-gradient(180deg, rgba(176, 159, 255, 0.1) 7%, rgba(138, 119, 237, 0.1) 46%)',
            color: '#8A77ED'
          }}
        >
          Under Development
        </div>
      </div>
    </div>
  );
}

