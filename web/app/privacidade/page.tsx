import Link from "next/link";

const sections = [
  {
    title: "1. Sobre esta Política",
    content: (
      <>
        <p>Esta Política de Privacidade explica como o Lumo Gestão trata dados pessoais no painel web e no aplicativo do colaborador. O Lumo é uma plataforma de gestão de RH e registro de ponto utilizada por empresas contratantes e seus colaboradores.</p>
        <p>No tratamento de dados de colaboradores, a empresa empregadora normalmente atua como controladora dos dados e o Lumo Gestão atua como operador, processando informações conforme as instruções da empresa contratante e a legislação aplicável, incluindo a Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018).</p>
      </>
    ),
  },
  {
    title: "2. Dados que podem ser tratados",
    content: (
      <>
        <p>Conforme os recursos habilitados pela empresa contratante, o Lumo pode tratar:</p>
        <ul>
          <li>dados de identificação e contato, como nome, e-mail e telefone;</li>
          <li>dados profissionais, como matrícula, cargo, setor, filial e vínculo com a empresa;</li>
          <li>dados de autenticação e informações necessárias para proteger o acesso à conta;</li>
          <li>registros de ponto, incluindo data, hora e tipo de marcação;</li>
          <li>localização do dispositivo no momento da marcação de ponto, quando esse recurso estiver habilitado;</li>
          <li>foto capturada no início e no encerramento da jornada, quando exigida pela política de ponto da empresa;</li>
          <li>informações relacionadas a férias, documentos, banco de horas, notificações e demais rotinas de RH disponibilizadas na plataforma;</li>
          <li>dados técnicos estritamente necessários ao funcionamento, segurança, diagnóstico e atualização do aplicativo.</li>
        </ul>
        <p>A fotografia usada na marcação de ponto funciona atualmente como evidência visual do registro. O Lumo não realiza reconhecimento facial ou comparação biométrica automática nessa funcionalidade.</p>
      </>
    ),
  },
  {
    title: "3. Localização e câmera",
    content: (
      <>
        <p>O aplicativo pode solicitar acesso à localização para verificar se a marcação de ponto ocorreu dentro do local autorizado pela empresa. A localização é utilizada no momento da tentativa de registro de ponto e não tem como finalidade realizar rastreamento contínuo do colaborador.</p>
        <p>A câmera pode ser utilizada para registrar uma foto no início e no encerramento da jornada. Nas marcações de saída e retorno de intervalo, o aplicativo pode registrar o ponto sem exigir foto, de acordo com a configuração atual do serviço.</p>
      </>
    ),
  },
  {
    title: "4. Finalidades do tratamento",
    content: (
      <ul>
        <li>autenticar usuários e proteger contas;</li>
        <li>vincular colaboradores à empresa correta;</li>
        <li>registrar, consultar e administrar jornadas e marcações de ponto;</li>
        <li>validar regras de localização definidas pela empresa;</li>
        <li>disponibilizar recursos de férias, documentos, banco de horas, perfil e notificações;</li>
        <li>prevenir fraude, abuso e acesso não autorizado;</li>
        <li>prestar suporte, corrigir falhas e manter o aplicativo atualizado;</li>
        <li>cumprir obrigações legais, regulatórias, contratuais e determinações de autoridades competentes.</li>
      </ul>
    ),
  },
  {
    title: "5. Bases legais",
    content: <p>O tratamento pode se apoiar, conforme cada situação, na execução de contrato, no cumprimento de obrigações legais ou regulatórias, no exercício regular de direitos, em interesses legítimos aplicáveis e em outras bases previstas na LGPD. A empresa contratante é responsável por definir e documentar as bases legais relativas aos dados de seus colaboradores quando atuar como controladora.</p>,
  },
  {
    title: "6. Compartilhamento e prestadores de serviço",
    content: (
      <>
        <p>Os dados podem ser acessados pela empresa contratante e por usuários autorizados por ela. Também podemos utilizar fornecedores de infraestrutura, hospedagem, banco de dados, autenticação, armazenamento, entrega e atualização de software e suporte técnico, sempre na medida necessária para a operação do serviço.</p>
        <p>Não comercializamos dados pessoais de colaboradores. O compartilhamento também poderá ocorrer quando necessário para cumprir obrigação legal, ordem judicial, requisição de autoridade competente ou para proteger direitos e segurança da plataforma e de seus usuários.</p>
      </>
    ),
  },
  {
    title: "7. Segurança",
    content: <p>Adotamos medidas técnicas e administrativas destinadas a reduzir riscos de acesso não autorizado, perda, alteração ou divulgação indevida, incluindo controles de autenticação, permissões de acesso, segregação de dados por empresa e comunicação protegida entre aplicativo, painel e serviços de backend. Nenhum sistema é totalmente imune a riscos, por isso os controles são revisados e aprimorados continuamente.</p>,
  },
  {
    title: "8. Retenção e exclusão",
    content: (
      <>
        <p>Os dados são mantidos pelo período necessário para prestar o serviço, atender às instruções da empresa contratante e cumprir obrigações legais e regulatórias. Alguns registros trabalhistas, de ponto ou documentos relacionados ao vínculo empregatício podem precisar ser preservados mesmo após o encerramento do acesso do usuário.</p>
        <p>O titular pode solicitar correção, acesso ou exclusão de dados à empresa empregadora ou ao canal de privacidade do Lumo. Quando a exclusão não puder ser realizada imediatamente por obrigação legal ou necessidade de exercício regular de direitos, a retenção será limitada ao período necessário.</p>
        <p>Para iniciar uma solicitação, acesse também a página de <Link href="/exclusao-de-dados" className="font-medium text-lumo-ink underline underline-offset-4">exclusão de dados</Link>.</p>
      </>
    ),
  },
  {
    title: "9. Direitos do titular",
    content: <p>Nos termos da LGPD, o titular pode solicitar, quando aplicável, confirmação da existência de tratamento, acesso, correção, anonimização, bloqueio ou eliminação, portabilidade, informações sobre compartilhamento, revisão de decisões automatizadas e demais direitos previstos em lei. Em dados tratados em nome de uma empresa contratante, o pedido pode precisar ser encaminhado ou validado pelo respectivo empregador.</p>,
  },
  {
    title: "10. Contas e acesso ao aplicativo",
    content: <p>O aplicativo do colaborador não é um serviço aberto de cadastro público. O acesso depende do vínculo e da autorização de uma empresa que utiliza o Lumo Gestão. A criação, ativação, desativação e administração dos acessos são realizadas de acordo com as regras da empresa contratante.</p>,
  },
  {
    title: "11. Alterações desta Política",
    content: <p>Esta Política poderá ser atualizada para refletir mudanças no produto, na legislação ou nas práticas de tratamento de dados. A versão vigente permanecerá disponível nesta página, com a data de atualização indicada abaixo.</p>,
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lumo-ink font-display text-lg font-bold text-lumo-turquoise">L</div>
          <div><p className="font-display text-lg font-semibold text-lumo-ink">Lumo Gestão</p><p className="text-sm text-lumo-slate">Gestão de RH descomplicada.</p></div>
        </div>
        <header className="border-b border-slate-200 pb-6">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-lumo-ink">Política de Privacidade</h1>
          <p className="mt-3 text-sm leading-6 text-lumo-slate">Última atualização: 14 de setembro de 2026.</p>
        </header>
        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700">
          {sections.map((section) => (
            <section key={section.title} className="space-y-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
              <h2 className="font-display text-xl font-semibold text-lumo-ink">{section.title}</h2>
              {section.content}
            </section>
          ))}
          <section className="space-y-3 rounded-xl bg-slate-50 p-5">
            <h2 className="font-display text-xl font-semibold text-lumo-ink">12. Responsável e contato de privacidade</h2>
            <p>Serviço operado por <strong>47.978.477 EDUARDO OLIVEIRA CARDOSO</strong>, CNPJ <strong>47.978.477/0001-00</strong>.</p>
            <p>Para solicitações de privacidade e proteção de dados, entre em contato pelo e-mail <a className="font-medium text-lumo-ink underline underline-offset-4" href="mailto:comprasguardm@gmail.com">comprasguardm@gmail.com</a>.</p>
            <p>Para assuntos relacionados ao vínculo empregatício, jornada ou documentos de RH, o colaborador também deve contatar o RH da empresa responsável por sua conta.</p>
          </section>
        </div>
        <footer className="mt-10 flex flex-wrap gap-4 border-t border-slate-200 pt-6 text-sm">
          <Link className="font-medium text-lumo-ink hover:underline" href="/login">Entrar no Lumo</Link>
          <Link className="font-medium text-lumo-ink hover:underline" href="/exclusao-de-dados">Solicitar exclusão de dados</Link>
        </footer>
      </article>
    </main>
  );
}