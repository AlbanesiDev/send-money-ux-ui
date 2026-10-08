'use client'

export default function RemittanceSuccessPage() {
  return (
    <main className="min-h-screen bg-[#f4f5fb] px-4 py-5 text-[#17233f] sm:px-8 lg:px-12">
      <section className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-[980px] items-center justify-center rounded-[18px] bg-white p-6 shadow-[0_12px_35px_rgba(24,37,73,0.05)] sm:p-12">
        <div className="flex w-full max-w-[620px] flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e1f7e9] text-4xl font-bold text-[#218052]" aria-hidden="true">✓</div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-[#218052]">Envío confirmado</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.02em] text-[#17233f]">La remesa fue enviada correctamente</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[#687790]">El cliente puede retirar el dinero con el código de referencia en el punto de pago seleccionado.</p>
          <div className="mt-8 w-full max-w-md rounded-xl border border-[#dce3ee] bg-[#fbfcfe] p-5 text-left">
            <div className="flex items-center justify-between border-b border-[#e4e8ef] pb-4">
              <span className="text-sm text-[#73809a]">Número de operación</span>
              <strong className="font-mono text-[#17233f]">RIA-20261008-018</strong>
            </div>
            <div className="flex items-center justify-between pt-4">
              <span className="text-sm text-[#73809a]">Total enviado</span>
              <strong className="text-lg text-[#465bc2]">18,01 USD</strong>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
