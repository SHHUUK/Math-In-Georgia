
import React, { useState, useEffect } from 'react';
import { Grid, Plus, Minus, X, ArrowRightLeft, Sigma, Trash2, Info, HelpCircle } from 'lucide-react';

interface MatrixMachineProps {
  onAddXp?: (amount: number, reason?: string) => void;
}

type Matrix = number[][];

export const MatrixMachine: React.FC<MatrixMachineProps> = ({ onAddXp }) => {
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [matrixA, setMatrixA] = useState<Matrix>([[1, 2], [3, 4]]);
  const [matrixB, setMatrixB] = useState<Matrix>([[5, 6], [7, 8]]);
  const [resultMatrix, setResultMatrix] = useState<Matrix | null>(null);
  const [scalarResult, setScalarResult] = useState<number | null>(null);
  const [operationName, setOperationName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Initialize matrices on resize
  useEffect(() => {
    const newA = Array(rows).fill(0).map(() => Array(cols).fill(0));
    const newB = Array(rows).fill(0).map(() => Array(cols).fill(0));
    // Preserve overlapping data
    for(let i=0; i<Math.min(rows, matrixA.length); i++) {
       for(let j=0; j<Math.min(cols, matrixA[0].length); j++) {
          newA[i][j] = matrixA[i][j];
          newB[i][j] = matrixB[i][j];
       }
    }
    setMatrixA(newA);
    setMatrixB(newB);
    setResultMatrix(null);
    setScalarResult(null);
    setError(null);
  }, [rows, cols]);

  const updateVal = (isA: boolean, r: number, c: number, val: string) => {
    const num = parseFloat(val) || 0;
    if (isA) {
      const newM = [...matrixA];
      newM[r] = [...newM[r]];
      newM[r][c] = num;
      setMatrixA(newM);
    } else {
      const newM = [...matrixB];
      newM[r] = [...newM[r]];
      newM[r][c] = num;
      setMatrixB(newM);
    }
  };

  const handleOp = (op: string) => {
    setError(null);
    setResultMatrix(null);
    setScalarResult(null);
    setOperationName(op);

    try {
      if (op === 'add') {
        const res = matrixA.map((row, i) => row.map((val, j) => val + matrixB[i][j]));
        setResultMatrix(res);
      } else if (op === 'sub') {
        const res = matrixA.map((row, i) => row.map((val, j) => val - matrixB[i][j]));
        setResultMatrix(res);
      } else if (op === 'mul') {
        // Simple square matrix multiplication for demo (nxn * nxn)
        if (rows !== cols) throw new Error("ამ ვერსიაში გამრავლება მუშაობს მხოლოდ კვადრატულ მატრიცებზე.");
        const res = Array(rows).fill(0).map(() => Array(cols).fill(0));
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            let sum = 0;
            for (let k = 0; k < cols; k++) {
              sum += matrixA[i][k] * matrixB[k][j];
            }
            res[i][j] = sum;
          }
        }
        setResultMatrix(res);
      } else if (op === 'detA') {
        if (rows !== cols) throw new Error("დეტერმინანტი ითვლება მხოლოდ კვადრატულ მატრიცაზე.");
        if (rows === 2) {
           setScalarResult(matrixA[0][0]*matrixA[1][1] - matrixA[0][1]*matrixA[1][0]);
        } else if (rows === 3) {
           const m = matrixA;
           const det = m[0][0]*(m[1][1]*m[2][2] - m[1][2]*m[2][1]) -
                       m[0][1]*(m[1][0]*m[2][2] - m[1][2]*m[2][0]) +
                       m[0][2]*(m[1][0]*m[2][1] - m[1][1]*m[2][0]);
           setScalarResult(det);
        } else {
           throw new Error("მხოლოდ 2x2 და 3x3 მატრიცების მხარდაჭერა.");
        }
      } else if (op === 'transA') {
        const res = Array(cols).fill(0).map((_, i) => Array(rows).fill(0).map((_, j) => matrixA[j][i]));
        setResultMatrix(res);
      }
      
      if (onAddXp) onAddXp(15, `მატრიცული ოპერაცია: ${op}`);

    } catch (e: any) {
      setError(e.message);
    }
  };

  const MatrixGrid = ({ data, isA, readOnly = false }: { data: Matrix, isA?: boolean, readOnly?: boolean }) => (
    <div className={`inline-block p-2 rounded-xl border-2 ${readOnly ? 'border-green-400 bg-green-50' : 'border-slate-300 bg-white'} relative`}>
       {/* Brackets */}
       <div className="absolute top-0 bottom-0 left-0 w-3 border-l-2 border-t-2 border-b-2 border-slate-800 rounded-l-lg"></div>
       <div className="absolute top-0 bottom-0 right-0 w-3 border-r-2 border-t-2 border-b-2 border-slate-800 rounded-r-lg"></div>
       
       <div className="grid gap-2 p-2" style={{ gridTemplateColumns: `repeat(${data[0].length}, minmax(0, 1fr))` }}>
          {data.map((row, i) => 
             row.map((val, j) => (
                <input 
                  key={`${i}-${j}`}
                  type="number"
                  readOnly={readOnly}
                  value={val}
                  onChange={(e) => !readOnly && isA !== undefined && updateVal(isA, i, j, e.target.value)}
                  className={`w-12 h-12 text-center font-mono text-lg font-bold rounded-lg focus:ring-2 outline-none transition-all ${readOnly ? 'bg-transparent text-green-800' : 'bg-slate-50 focus:bg-white focus:ring-indigo-500 text-slate-800'}`}
                />
             ))
          )}
       </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 p-4 md:p-8 animate-fadeIn overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full">
        
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 mb-6 flex justify-between items-start">
           <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                 <Grid className="text-indigo-600" size={32} /> მატრიცული კალკულატორი
              </h1>
              <p className="text-slate-500 mt-1">წრფივი ალგებრის ოპერაციები (2x2, 3x3)</p>
           </div>
           <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
              <Info size={24} />
           </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-6">
           <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-bold text-slate-500 uppercase">ზომა:</span>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                 <button onClick={() => {setRows(2); setCols(2)}} className={`px-4 py-1 rounded-md text-sm font-bold transition-all ${rows===2 ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>2 x 2</button>
                 <button onClick={() => {setRows(3); setCols(3)}} className={`px-4 py-1 rounded-md text-sm font-bold transition-all ${rows===3 ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>3 x 3</button>
              </div>
              <button onClick={() => {setMatrixA(matrixA.map(r => r.map(() => 0))); setMatrixB(matrixB.map(r => r.map(() => 0)))}} className="ml-auto text-slate-400 hover:text-red-500 transition-colors" title="გასუფთავება"><Trash2 size={20} /></button>
           </div>

           <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                 <span className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-xs">მატრიცა A</span>
                 <MatrixGrid data={matrixA} isA={true} />
              </div>

              <div className="flex flex-col gap-2">
                 <button onClick={() => handleOp('add')} className="p-3 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 rounded-xl transition-all" title="შეკრება A+B"><Plus size={20} /></button>
                 <button onClick={() => handleOp('sub')} className="p-3 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 rounded-xl transition-all" title="გამოკლება A-B"><Minus size={20} /></button>
                 <button onClick={() => handleOp('mul')} className="p-3 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 rounded-xl transition-all" title="გამრავლება A*B"><X size={20} /></button>
              </div>

              <div className="flex flex-col items-center gap-2">
                 <span className="font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-xs">მატრიცა B</span>
                 <MatrixGrid data={matrixB} isA={false} />
              </div>
           </div>
           
           <div className="mt-6 flex justify-center gap-4 border-t border-slate-100 pt-6">
              <button onClick={() => handleOp('detA')} className="px-6 py-2 bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-600 rounded-lg font-bold text-sm transition-all flex items-center gap-2"><Sigma size={16} /> Det(A)</button>
              <button onClick={() => handleOp('transA')} className="px-6 py-2 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 rounded-lg font-bold text-sm transition-all flex items-center gap-2"><ArrowRightLeft size={16} /> Trans(A)</button>
           </div>
        </div>

        {/* Result Area */}
        {(resultMatrix || scalarResult !== null || error) && (
           <div className="animate-in slide-in-from-bottom-4">
              {error ? (
                 <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl text-red-700 font-bold flex items-center gap-3">
                    <HelpCircle /> {error}
                 </div>
              ) : (
                 <div className="bg-white rounded-3xl shadow-lg border border-green-200 p-8 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
                    <span className="text-xs font-bold text-green-600 uppercase tracking-widest mb-4">შედეგი ({operationName})</span>
                    
                    {resultMatrix && <MatrixGrid data={resultMatrix} readOnly />}
                    {scalarResult !== null && (
                       <div className="text-5xl font-mono font-bold text-slate-800">{scalarResult}</div>
                    )}
                 </div>
              )}
           </div>
        )}

      </div>
    </div>
  );
};
