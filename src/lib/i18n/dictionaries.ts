export type Language = "pt" | "en";

export type Dictionary = {
  auth: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    confirmPassword: string;
    login: string;
    register: string;
    google: string;
    goToRegister: string;
    goToLogin: string;
    emailRequired: string;
    passwordMin: string;
    passwordMismatch: string;
    remember: string;
    defaultModuleLabel: string;
  };
  layout: {
    dashboard: string;
    settings: string;
    profile: string;
    limits: string;
    back: string;
    newWorkspace: string;
    shareWorkspace: string;
    workspaceSettings: string;
    profileSettings: string;
    logout: string;
    modules: string;
    workspaces: string;
    theme: string;
    language: string;
  };
  modules: {
    reminders: string;
    secrets: string;
    documents: string;
    finance: string;
    hr: string;
    purchasing: string;
    calendar: string;
  };
  limits: {
    title: string;
    subtitle: string;
    view: string;
    currentPlan: string;
    changePlan: string;
    seatPacks: string;
    usageTitle: string;
    usedOf: string;
    unlimited: string;
    members: string;
    workspaces: string;
    storage: string;
    integrations: string;
    integrationsEnabled: string;
    integrationsBlocked: string;
    businessRules: string;
    membersDescription: string;
    workspacesDescription: string;
    storageDescription: string;
    ruleWorkspacesTitle: string;
    ruleWorkspacesDescription: string;
    ruleRolesTitle: string;
    ruleRolesDescription: string;
    ruleSharingTitle: string;
    ruleSharingDescription: string;
    upgradeTitle: string;
    upgradeSubtitle: string;
    upgradeCta: string;
  };
  settings: {
    title: string;
    plan: string;
    billing: string;
    limits: string;
  };
  profile: {
    title: string;
    name: string;
    photo: string;
    save: string;
  };
  secrets: {
    title: string;
    subtitle: string;
    newButton: string;
    searchLabel: string;
    searchPlaceholder: string;
    typeLabel: string;
    all: string;
    sortLabel: string;
    directionLabel: string;
    updatedAt: string;
    titleLabel: string;
    desc: string;
    asc: string;
    tableTitle: string;
    tableUser: string;
    tableType: string;
    tableUpdated: string;
    tableActions: string;
    view: string;
    loading: string;
    empty: string;
    page: string;
    prev: string;
    next: string;
    modalTitle: string;
    fieldTitle: string;
    fieldType: string;
    fieldUser: string;
    fieldSecret: string;
    fieldUrl: string;
    fieldNotes: string;
    cancel: string;
    save: string;
    saving: string;
    requiredError: string;
    saveError: string;
    loadError: string;
    viewTitle: string;
    close: string;
    edit: string;
    update: string;
    updating: string;
    delete: string;
    deleting: string;
    deleteConfirm: string;
    deleteError: string;
    updateError: string;
    typeAccount: string;
    typeServer: string;
    typeApi: string;
    typeOther: string;
  };
};

export const dictionaries: Record<Language, Dictionary> = {
  pt: {
    auth: {
      title: "Entrar",
      subtitle: "Acesse sua organização com segurança.",
      email: "E-mail",
      password: "Senha",
      confirmPassword: "Confirmar senha",
      login: "Entrar",
      register: "Criar conta",
      google: "Continuar com Google",
      goToRegister: "Ainda não tem conta? Criar agora",
      goToLogin: "Já tem conta? Entrar",
      emailRequired: "Informe um e-mail válido.",
      passwordMin: "A senha deve ter pelo menos 8 caracteres.",
      passwordMismatch: "As senhas não conferem.",
      remember: "Manter conectado",
      defaultModuleLabel: "Módulo inicial",
    },
    layout: {
      dashboard: "Painel",
      settings: "Configurações",
      profile: "Perfil",
      limits: "Limites",
      back: "Voltar",
      newWorkspace: "Criar workspace",
      shareWorkspace: "Compartilhar workspace",
      workspaceSettings: "Configurações do workspace",
      profileSettings: "Configurações do perfil",
      logout: "Sair",
      modules: "Módulos",
      workspaces: "Workspaces",
      theme: "Tema",
      language: "Idioma",
    },
    modules: {
      reminders: "Lembretes",
      secrets: "Segredos",
      documents: "Documentos",
      finance: "Finanças",
      hr: "RH",
      purchasing: "Compras",
      calendar: "Calendário",
    },
    limits: {
      title: "Limites do workspace",
      subtitle: "Acompanhe os limites do seu plano e as regras de uso do workspace.",
      view: "Ver limites",
      currentPlan: "Plano atual",
      changePlan: "Alterar plano",
      seatPacks: "Seat packs ativos",
      usageTitle: "Uso do plano",
      usedOf: "usado de",
      unlimited: "Ilimitado",
      members: "Membros",
      workspaces: "Workspaces",
      storage: "Armazenamento",
      integrations: "Integrações",
      integrationsEnabled: "Ativo",
      integrationsBlocked: "Bloqueado",
      businessRules: "Regras de negócio",
      membersDescription: "Quantidade máxima de membros ativos no workspace.",
      workspacesDescription: "Total de workspaces permitidos para o plano.",
      storageDescription: "Espaço total disponível para arquivos e documentos.",
      ruleWorkspacesTitle: "Workspaces",
      ruleWorkspacesDescription:
        "Cada usuário pode ter um workspace pessoal e, opcionalmente, um workspace da empresa.",
      ruleRolesTitle: "Papéis & permissões",
      ruleRolesDescription:
        "Admins controlam o acesso aos módulos e as permissões de edição por membro.",
      ruleSharingTitle: "Compartilhamento",
      ruleSharingDescription:
        "Workspaces pessoais podem ser compartilhados com pelo menos uma pessoa para colaboração.",
      upgradeTitle: "Precisa aumentar os limites?",
      upgradeSubtitle: "Atualize o plano para liberar mais módulos e capacidade.",
      upgradeCta: "Ver planos",
    },
    settings: {
      title: "Configurações",
      plan: "Plano atual",
      billing: "Pagamento",
      limits: "Limites",
    },
    profile: {
      title: "Perfil",
      name: "Nome",
      photo: "Foto",
      save: "Salvar",
    },
    secrets: {
      title: "Segredos",
      subtitle: "Cadastre segredos, chaves e registros sensíveis com segurança.",
      newButton: "+ Novo segredo",
      searchLabel: "Buscar",
      searchPlaceholder: "Pesquisar por título ou usuário",
      typeLabel: "Tipo",
      all: "Todos",
      sortLabel: "Ordenar",
      directionLabel: "Direção",
      updatedAt: "Atualização",
      titleLabel: "Título",
      desc: "Desc",
      asc: "Asc",
      tableTitle: "Título",
      tableUser: "Usuário/Chave",
      tableType: "Tipo",
      tableUpdated: "Atualizado",
      tableActions: "Ações",
      view: "Ver",
      loading: "Carregando registros...",
      empty: "Nenhum registro encontrado.",
      page: "Página",
      prev: "Anterior",
      next: "Próximo",
      modalTitle: "Novo segredo",
      fieldTitle: "Título",
      fieldType: "Tipo",
      fieldUser: "Usuário/Chave",
      fieldSecret: "Segredo",
      fieldUrl: "URL",
      fieldNotes: "Notas",
      cancel: "Cancelar",
      save: "Salvar",
      saving: "Salvando...",
      requiredError: "Preencha o título e o segredo.",
      saveError: "Não foi possível salvar o registro.",
      loadError: "Não foi possível carregar os registros.",
      viewTitle: "Detalhes do segredo",
      close: "Fechar",
      edit: "Editar",
      update: "Atualizar",
      updating: "Atualizando...",
      delete: "Excluir",
      deleting: "Excluindo...",
      deleteConfirm: "Tem certeza que deseja excluir este segredo?",
      deleteError: "Não foi possível excluir o registro.",
      updateError: "Não foi possível atualizar o registro.",
      typeAccount: "Conta",
      typeServer: "Servidor",
      typeApi: "API",
      typeOther: "Outro",
    },
  },
  en: {
    auth: {
      title: "Sign in",
      subtitle: "Access your organization securely.",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm password",
      login: "Sign in",
      register: "Create account",
      google: "Continue with Google",
      goToRegister: "No account yet? Create one",
      goToLogin: "Already have an account? Sign in",
      emailRequired: "Please enter a valid email.",
      passwordMin: "Password must be at least 8 characters.",
      passwordMismatch: "Passwords do not match.",
      remember: "Keep me signed in",
      defaultModuleLabel: "Default module",
    },
    layout: {
      dashboard: "Dashboard",
      settings: "Settings",
      profile: "Profile",
      limits: "Limits",
      back: "Back",
      newWorkspace: "Create workspace",
      shareWorkspace: "Share workspace",
      workspaceSettings: "Workspace settings",
      profileSettings: "Profile settings",
      logout: "Sign out",
      modules: "Modules",
      workspaces: "Workspaces",
      theme: "Theme",
      language: "Language",
    },
    modules: {
      reminders: "Reminders",
      secrets: "Secrets",
      documents: "Documents",
      finance: "Finance",
      hr: "HR",
      purchasing: "Purchasing",
      calendar: "Calendar",
    },
    limits: {
      title: "Workspace limits",
      subtitle: "Track plan limits and workspace usage rules.",
      view: "View limits",
      currentPlan: "Current plan",
      changePlan: "Change plan",
      seatPacks: "Active seat packs",
      usageTitle: "Plan usage",
      usedOf: "used of",
      unlimited: "Unlimited",
      members: "Members",
      workspaces: "Workspaces",
      storage: "Storage",
      integrations: "Integrations",
      integrationsEnabled: "Enabled",
      integrationsBlocked: "Blocked",
      businessRules: "Business rules",
      membersDescription: "Maximum active members allowed in the workspace.",
      workspacesDescription: "Total workspaces allowed for the plan.",
      storageDescription: "Total space available for files and documents.",
      ruleWorkspacesTitle: "Workspaces",
      ruleWorkspacesDescription:
        "Each user can have a personal workspace and optionally a company workspace.",
      ruleRolesTitle: "Roles & permissions",
      ruleRolesDescription:
        "Admins control module access and edit permissions per member.",
      ruleSharingTitle: "Sharing",
      ruleSharingDescription:
        "Personal workspaces can be shared with at least one person for collaboration.",
      upgradeTitle: "Need higher limits?",
      upgradeSubtitle: "Upgrade the plan to unlock more modules and capacity.",
      upgradeCta: "View plans",
    },
    settings: {
      title: "Settings",
      plan: "Current plan",
      billing: "Billing",
      limits: "Limits",
    },
    profile: {
      title: "Profile",
      name: "Name",
      photo: "Photo",
      save: "Save",
    },
    secrets: {
      title: "Secrets",
      subtitle: "Store secrets, keys, and sensitive records securely.",
      newButton: "+ New secret",
      searchLabel: "Search",
      searchPlaceholder: "Search by title or username",
      typeLabel: "Type",
      all: "All",
      sortLabel: "Sort",
      directionLabel: "Direction",
      updatedAt: "Updated",
      titleLabel: "Title",
      desc: "Desc",
      asc: "Asc",
      tableTitle: "Title",
      tableUser: "Username/Key",
      tableType: "Type",
      tableUpdated: "Updated",
      tableActions: "Actions",
      view: "View",
      loading: "Loading records...",
      empty: "No records found.",
      page: "Page",
      prev: "Previous",
      next: "Next",
      modalTitle: "New secret",
      fieldTitle: "Title",
      fieldType: "Type",
      fieldUser: "Username/Key",
      fieldSecret: "Secret",
      fieldUrl: "URL",
      fieldNotes: "Notes",
      cancel: "Cancel",
      save: "Save",
      saving: "Saving...",
      requiredError: "Please fill in title and secret.",
      saveError: "Unable to save the record.",
      loadError: "Unable to load records.",
      viewTitle: "Secret details",
      close: "Close",
      edit: "Edit",
      update: "Update",
      updating: "Updating...",
      delete: "Delete",
      deleting: "Deleting...",
      deleteConfirm: "Are you sure you want to delete this secret?",
      deleteError: "Unable to delete the record.",
      updateError: "Unable to update the record.",
      typeAccount: "Account",
      typeServer: "Server",
      typeApi: "API",
      typeOther: "Other",
    },
  },
};
