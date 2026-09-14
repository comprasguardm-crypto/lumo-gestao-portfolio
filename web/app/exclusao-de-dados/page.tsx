import Link from "next/link";

export default function DataDeletionPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <article className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lumo-ink font-display text-lg font-bold text-lumo-turquoise">L</div>
          <div><p className="font-display text-lg font-semibold text-lumo-ink">Lumo Gestão</p><p className="text-sm text-lumo-slate">Privacidade e proteção de dados</p></div>
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-lumo-ink">Exclusão e correção de dados</h1>
        <p className="mt-4 text-sm leading-7 text-slate-700">Se você utiliza o aplicativo Lumo Gestão por meio da empresa em que trabalha, pode solicitar acesso, correção ou exclusão de dados pessoais. Como determinados registros de RH e ponto podem estar sujeitos a obrigações legais de retenção, algumas informações não poderão ser eliminadas imediatamente.</p>
        <section className="mt-8 space-y-3 rounded-xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">
          <h2 className="font-display text-xl font-semibold text-lumo-ink">Como solicitar</h2>
          <p>Envie um e-mail para <a className="font-medium text-lumo-ink underline underline-offset-4" href="mailto:comprasguardm@gmail.com?subject=Solicitação%20de%20privacidade%20-%20Lumo%20Gestão">comprasguardm@gmail.com</a> com o assunto <strong>Solicitação de privacidade - Lumo Gestão</strong>.</p>
          <p>Informe apenas:</p>
          <ul className="list-disc space-y-1 pl-5"><li>seu nome completo;</li><li>o e-mail utilizado no Lumo;</li><li>o nome da empresa à qual sua conta está vinculada;</li><li>se deseja acesso, correção ou exclusão.</li></ul>
          <p>Não envie senha, foto de documento ou outros dados sensíveis no primeiro contato.</p>
        </section>
        <section className="mt-8 space-y-3 text-sm leading-7 text-slate-700">
          <h2 className="font-display text-xl font-semibold text-lumo-ink">O que acontece depois</h2>
          <p>A solicitação será analisada e, quando o Lumo atuar como operador dos dados, poderá ser necessário validar o pedido junto à empresa contratante responsável pelo vínculo do colaborador. Dados cuja retenção seja exigida por lei ou necessária ao exercício regular de direitos poderão ser preservados pelo período aplicável.</p>
        </section>
        <div className="mt-10 flex flex-wrap gap-4 border-t border-slate-200 pt-6 text-sm">
          <Link className="font-medium text-lumo-ink hover:underline" href="/privacidade">Política de Privacidade</Link>
          <Link className="font-medium text-lumo-ink hover:underline" href="/login">Entrar no Lumo</Link>
        </div>
      </article>
    </main>
  );
}