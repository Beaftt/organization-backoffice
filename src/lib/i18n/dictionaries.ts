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
  documents: {
    subtitle: string;
    newFolder: string;
    uploadFile: string;
    allFolders: string;
    searchLabel: string;
    searchPlaceholder: string;
    typeLabel: string;
    typeAll: string;
    typePdf: string;
    typeImage: string;
    typeSpreadsheet: string;
    typeOther: string;
    sortLabel: string;
    sortUpdated: string;
    sortName: string;
    tableFile: string;
    tableFolder: string;
    tableType: string;
    tableUpdated: string;
    tableActions: string;
    open: string;
    page: string;
    pageOf: string;
    prev: string;
    next: string;
    folders: {
      contracts: string;
      tax: string;
      hr: string;
      personal: string;
    };
    files: {
      vendorContract: string;
      januaryInvoice: string;
      resumeJohn: string;
      documentPhoto: string;
      costSpreadsheet: string;
    };
  };
  finance: {
    subtitle: string;
    newType: string;
    newTransaction: string;
    recurringTitle: string;
    typesTitle: string;
    searchLabel: string;
    searchPlaceholder: string;
    groupLabel: string;
    groupAll: string;
    groupIncome: string;
    groupExpense: string;
    typeLabel: string;
    statusLabel: string;
    statusAll: string;
    statusPaid: string;
    statusPending: string;
    sortLabel: string;
    sortDate: string;
    sortAmount: string;
    tableTitle: string;
    tableType: string;
    tableDate: string;
    tableAmount: string;
    tableStatus: string;
    tableActions: string;
    details: string;
    page: string;
    pageOf: string;
    prev: string;
    next: string;
    nextDueLabel: string;
    cadenceMonthly: string;
    cadenceQuarterly: string;
    types: {
      salary: string;
      subscriptions: string;
      taxes: string;
      services: string;
    };
    transactions: {
      salaryJanuary: string;
      spotify: string;
      iss: string;
      consulting: string;
      netflix: string;
    };
    recurring: {
      monthlyTaxes: string;
      streamingSubscriptions: string;
      accountingServices: string;
    };
  };
  calendar: {
    subtitle: string;
    newEvent: string;
    filterModuleLabel: string;
    filterStatusLabel: string;
    filterAll: string;
    statusPending: string;
    statusDone: string;
    monthTitle: string;
    monthSummary: string;
    monthEventsTitle: string;
    days: string[];
    events: {
      monthlyTaxes: string;
      hrRecruitmentMeeting: string;
      renewDocument: string;
      updateCredentials: string;
    };
  };
  reminders: {
    title: string;
    subtitle: string;
    newList: string;
    listsTitle: string;
    itemsTitle: string;
    addItem: string;
    itemPlaceholder: string;
    emptyItems: string;
    quickAddHint: string;
    monthlyResetLabel: string;
    financeLinkLabel: string;
    calendarLinkLabel: string;
    statusDone: string;
    statusPending: string;
    listTitleLabel: string;
    listDescriptionLabel: string;
    listResetDayLabel: string;
    createList: string;
    cancel: string;
    editList: string;
    listSettings: string;
    deleteList: string;
    deleteItem: string;
    confirmDeleteList: string;
    confirmDeleteItem: string;
    loading: string;
    loadError: string;
    saveError: string;
    updateError: string;
    filtersTitle: string;
    searchLabel: string;
    searchPlaceholder: string;
    statusLabel: string;
    statusAll: string;
    financeTypeLabel: string;
    financeCategoryLabel: string;
    financeTagsLabel: string;
    financeTagsPlaceholder: string;
    itemDetailsTitle: string;
    saveItem: string;
    notesLabel: string;
    dueDateLabel: string;
    privateListLabel: string;
    allowedUsersLabel: string;
    assigneesLabel: string;
    addUsers: string;
    addUsersTitle: string;
    noMembers: string;
    list: {
      monthlyBills: string;
      groceries: string;
    };
    items: {
      rent: string;
      electricity: string;
      internet: string;
      milk: string;
      vegetables: string;
      coffee: string;
    };
    badges: {
      monthly: string;
      financeLinked: string;
      calendarLinked: string;
    };
    finance: {
      income: string;
      expense: string;
      service: string;
    };
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
    documents: {
      subtitle: "Organize arquivos por pastas e mantenha tudo centralizado.",
      newFolder: "+ Nova pasta",
      uploadFile: "+ Enviar arquivo",
      allFolders: "Todas as pastas",
      searchLabel: "Buscar",
      searchPlaceholder: "Pesquisar por nome do arquivo",
      typeLabel: "Tipo",
      typeAll: "Todos",
      typePdf: "PDF",
      typeImage: "Imagem",
      typeSpreadsheet: "Planilha",
      typeOther: "Outro",
      sortLabel: "Ordenar",
      sortUpdated: "Atualização",
      sortName: "Nome",
      tableFile: "Arquivo",
      tableFolder: "Pasta",
      tableType: "Tipo",
      tableUpdated: "Atualizado",
      tableActions: "Ações",
      open: "Abrir",
      page: "Página",
      pageOf: "de",
      prev: "Anterior",
      next: "Próximo",
      folders: {
        contracts: "Contratos",
        tax: "Fiscal",
        hr: "RH",
        personal: "Pessoal",
      },
      files: {
        vendorContract: "Contrato fornecedor.pdf",
        januaryInvoice: "Nota fiscal janeiro.pdf",
        resumeJohn: "Currículo João.pdf",
        documentPhoto: "Foto documento.png",
        costSpreadsheet: "Planilha custos.xlsx",
      },
    },
    finance: {
      subtitle: "Registre despesas, receitas e recorrências mensais.",
      newType: "+ Novo tipo",
      newTransaction: "+ Nova transação",
      recurringTitle: "Checklist de contas recorrentes",
      typesTitle: "Tipos financeiros",
      searchLabel: "Buscar",
      searchPlaceholder: "Pesquisar transações",
      groupLabel: "Grupo",
      groupAll: "Todos",
      groupIncome: "Receita",
      groupExpense: "Despesa",
      typeLabel: "Tipo",
      statusLabel: "Status",
      statusAll: "Todos",
      statusPaid: "Pago",
      statusPending: "Pendente",
      sortLabel: "Ordenar",
      sortDate: "Data",
      sortAmount: "Valor",
      tableTitle: "Título",
      tableType: "Tipo",
      tableDate: "Data",
      tableAmount: "Valor",
      tableStatus: "Status",
      tableActions: "Ações",
      details: "Detalhes",
      page: "Página",
      pageOf: "de",
      prev: "Anterior",
      next: "Próximo",
      nextDueLabel: "Próx:",
      cadenceMonthly: "Mensal",
      cadenceQuarterly: "Trimestral",
      types: {
        salary: "Salário",
        subscriptions: "Assinaturas",
        taxes: "Impostos",
        services: "Serviços",
      },
      transactions: {
        salaryJanuary: "Salário janeiro",
        spotify: "Spotify",
        iss: "ISS",
        consulting: "Consultoria",
        netflix: "Netflix",
      },
      recurring: {
        monthlyTaxes: "Impostos mensais",
        streamingSubscriptions: "Assinaturas streaming",
        accountingServices: "Serviços contabilidade",
      },
    },
    calendar: {
      subtitle: "Eventos integrados de finanças, RH, documentos e lembretes.",
      newEvent: "+ Novo evento",
      filterModuleLabel: "Módulo",
      filterStatusLabel: "Status",
      filterAll: "Todos",
      statusPending: "Pendente",
      statusDone: "Concluído",
      monthTitle: "Janeiro 2026",
      monthSummary: "Resumo mensal",
      monthEventsTitle: "Eventos do mês",
      days: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
      events: {
        monthlyTaxes: "Impostos mensais",
        hrRecruitmentMeeting: "Reunião RH - recrutamento",
        renewDocument: "Renovar documento",
        updateCredentials: "Atualizar credenciais",
      },
    },
    reminders: {
      title: "Lembretes",
      subtitle: "Crie checklists rápidos e organize tarefas recorrentes.",
      newList: "+ Nova lista",
      listsTitle: "Listas rápidas",
      itemsTitle: "Checklist",
      addItem: "Adicionar item",
      itemPlaceholder: "Adicionar item na lista",
      emptyItems: "Nenhum item ainda. Adicione o primeiro lembrete.",
      quickAddHint: "Marque como pago ou pendente com um clique.",
      monthlyResetLabel: "Resetar todo mês",
      financeLinkLabel: "Linkar ao módulo de finanças",
      calendarLinkLabel: "Linkar ao calendário",
      statusDone: "Concluído",
      statusPending: "Pendente",
      listTitleLabel: "Nome da lista",
      listDescriptionLabel: "Descrição",
      listResetDayLabel: "Dia do mês",
      createList: "Criar lista",
      cancel: "Cancelar",
      editList: "Editar lista",
      listSettings: "Configurações",
      deleteList: "Excluir lista",
      deleteItem: "Excluir item",
      confirmDeleteList: "Tem certeza que deseja excluir esta lista?",
      confirmDeleteItem: "Tem certeza que deseja excluir este item?",
      loading: "Carregando listas...",
      loadError: "Não foi possível carregar os lembretes.",
      saveError: "Não foi possível salvar o lembrete.",
      updateError: "Não foi possível atualizar o lembrete.",
      filtersTitle: "Filtros",
      searchLabel: "Buscar",
      searchPlaceholder: "Buscar itens",
      statusLabel: "Status",
      statusAll: "Todos",
      financeTypeLabel: "Tipo financeiro",
      financeCategoryLabel: "Categoria",
      financeTagsLabel: "Tags",
      financeTagsPlaceholder: "pago, pendente",
      itemDetailsTitle: "Detalhes do item",
      saveItem: "Salvar item",
      notesLabel: "Notas",
      dueDateLabel: "Data de vencimento",
      privateListLabel: "Lista privada",
      allowedUsersLabel: "Usuários com acesso",
      assigneesLabel: "Responsáveis",
      addUsers: "Adicionar usuários",
      addUsersTitle: "Adicionar acesso",
      noMembers: "Nenhum usuário encontrado.",
      list: {
        monthlyBills: "Contas mensais",
        groceries: "Lista de supermercado",
      },
      items: {
        rent: "Aluguel",
        electricity: "Conta de luz",
        internet: "Internet",
        milk: "Leite",
        vegetables: "Verduras",
        coffee: "Café",
      },
      badges: {
        monthly: "Mensal",
        financeLinked: "Financeiro",
        calendarLinked: "Calendário",
      },
      finance: {
        income: "Receita",
        expense: "Despesa",
        service: "Serviço",
      },
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
    documents: {
      subtitle: "Organize files by folders and keep everything centralized.",
      newFolder: "+ New folder",
      uploadFile: "+ Upload file",
      allFolders: "All folders",
      searchLabel: "Search",
      searchPlaceholder: "Search by file name",
      typeLabel: "Type",
      typeAll: "All",
      typePdf: "PDF",
      typeImage: "Image",
      typeSpreadsheet: "Spreadsheet",
      typeOther: "Other",
      sortLabel: "Sort",
      sortUpdated: "Updated",
      sortName: "Name",
      tableFile: "File",
      tableFolder: "Folder",
      tableType: "Type",
      tableUpdated: "Updated",
      tableActions: "Actions",
      open: "Open",
      page: "Page",
      pageOf: "of",
      prev: "Previous",
      next: "Next",
      folders: {
        contracts: "Contracts",
        tax: "Tax",
        hr: "HR",
        personal: "Personal",
      },
      files: {
        vendorContract: "Vendor contract.pdf",
        januaryInvoice: "January invoice.pdf",
        resumeJohn: "John resume.pdf",
        documentPhoto: "Document photo.png",
        costSpreadsheet: "Cost spreadsheet.xlsx",
      },
    },
    finance: {
      subtitle: "Track expenses, income, and monthly recurring items.",
      newType: "+ New type",
      newTransaction: "+ New transaction",
      recurringTitle: "Recurring bills checklist",
      typesTitle: "Finance types",
      searchLabel: "Search",
      searchPlaceholder: "Search transactions",
      groupLabel: "Group",
      groupAll: "All",
      groupIncome: "Income",
      groupExpense: "Expense",
      typeLabel: "Type",
      statusLabel: "Status",
      statusAll: "All",
      statusPaid: "Paid",
      statusPending: "Pending",
      sortLabel: "Sort",
      sortDate: "Date",
      sortAmount: "Amount",
      tableTitle: "Title",
      tableType: "Type",
      tableDate: "Date",
      tableAmount: "Amount",
      tableStatus: "Status",
      tableActions: "Actions",
      details: "Details",
      page: "Page",
      pageOf: "of",
      prev: "Previous",
      next: "Next",
      nextDueLabel: "Next:",
      cadenceMonthly: "Monthly",
      cadenceQuarterly: "Quarterly",
      types: {
        salary: "Salary",
        subscriptions: "Subscriptions",
        taxes: "Taxes",
        services: "Services",
      },
      transactions: {
        salaryJanuary: "January salary",
        spotify: "Spotify",
        iss: "ISS",
        consulting: "Consulting",
        netflix: "Netflix",
      },
      recurring: {
        monthlyTaxes: "Monthly taxes",
        streamingSubscriptions: "Streaming subscriptions",
        accountingServices: "Accounting services",
      },
    },
    calendar: {
      subtitle: "Integrated events across finance, HR, documents, and reminders.",
      newEvent: "+ New event",
      filterModuleLabel: "Module",
      filterStatusLabel: "Status",
      filterAll: "All",
      statusPending: "Pending",
      statusDone: "Done",
      monthTitle: "January 2026",
      monthSummary: "Monthly summary",
      monthEventsTitle: "Events this month",
      days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      events: {
        monthlyTaxes: "Monthly taxes",
        hrRecruitmentMeeting: "HR meeting - recruitment",
        renewDocument: "Renew document",
        updateCredentials: "Update credentials",
      },
    },
    reminders: {
      title: "Reminders",
      subtitle: "Create quick checklists and manage recurring tasks.",
      newList: "+ New list",
      listsTitle: "Quick lists",
      itemsTitle: "Checklist",
      addItem: "Add item",
      itemPlaceholder: "Add item to list",
      emptyItems: "No items yet. Add the first reminder.",
      quickAddHint: "Mark as paid or pending with one click.",
      monthlyResetLabel: "Reset every month",
      financeLinkLabel: "Link to finance module",
      calendarLinkLabel: "Link to calendar",
      statusDone: "Done",
      statusPending: "Pending",
      listTitleLabel: "List name",
      listDescriptionLabel: "Description",
      listResetDayLabel: "Day of month",
      createList: "Create list",
      cancel: "Cancel",
      editList: "Edit list",
      listSettings: "Settings",
      deleteList: "Delete list",
      deleteItem: "Delete item",
      confirmDeleteList: "Are you sure you want to delete this list?",
      confirmDeleteItem: "Are you sure you want to delete this item?",
      loading: "Loading lists...",
      loadError: "Unable to load reminders.",
      saveError: "Unable to save reminder.",
      updateError: "Unable to update reminder.",
      filtersTitle: "Filters",
      searchLabel: "Search",
      searchPlaceholder: "Search items",
      statusLabel: "Status",
      statusAll: "All",
      financeTypeLabel: "Finance type",
      financeCategoryLabel: "Category",
      financeTagsLabel: "Tags",
      financeTagsPlaceholder: "paid, pending",
      itemDetailsTitle: "Item details",
      saveItem: "Save item",
      notesLabel: "Notes",
      dueDateLabel: "Due date",
      privateListLabel: "Private list",
      allowedUsersLabel: "Allowed users",
      assigneesLabel: "Assignees",
      addUsers: "Add users",
      addUsersTitle: "Add access",
      noMembers: "No users found.",
      list: {
        monthlyBills: "Monthly bills",
        groceries: "Grocery list",
      },
      items: {
        rent: "Rent",
        electricity: "Electricity bill",
        internet: "Internet",
        milk: "Milk",
        vegetables: "Vegetables",
        coffee: "Coffee",
      },
      badges: {
        monthly: "Monthly",
        financeLinked: "Finance",
        calendarLinked: "Calendar",
      },
      finance: {
        income: "Income",
        expense: "Expense",
        service: "Service",
      },
    },
  },
};
