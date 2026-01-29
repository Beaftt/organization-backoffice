export type Language = "pt" | "en";

/*
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
        members: "Members",
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
        comingSoon: "Coming soon",
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
      calendar: {
        subtitle: "Organize lembretes, reuniões e prazos em um só lugar.",
        newEvent: "Novo evento",
        filterModuleLabel: "Módulo",
        filterStatusLabel: "Status",
        filterAll: "Todos",
        statusPending: "Pendente",
        statusDone: "Concluído",
        monthTitle: "Visão mensal",
        monthSummary: "Confira eventos e compromissos do mês.",
        monthEventsTitle: "Eventos do mês",
        viewDay: "Ver dia",
        dayViewTitle: "Visualização do dia",
        documentsLoading: "Carregando documentos...",
        documentsEmpty: "Nenhum documento na raiz.",
        days: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
        events: {
          monthlyTaxes: "Impostos mensais",
          hrRecruitmentMeeting: "Reunião de recrutamento",
          renewDocument: "Renovar documento",
          updateCredentials: "Atualizar credenciais",
        },
        filtersTitle: "Filtros",
        viewDay: "Ver dia",
        dayViewTitle: "Visualização do dia",
        documentsLoading: "Carregando documentos...",
        documentsEmpty: "Nenhum documento na raiz.",
        sectionDetails: "Detalhes",
        sectionParticipants: "Participantes",
        sectionDocuments: "Documentos e ata",
        sectionRecurrence: "Recorrência",
        filterOwnersLabel: "Calendários visíveis",
        filterOwnersHint: "Selecione membros para filtrar. Sem seleção mostra tudo que você pode ver.",
        filterDateFromLabel: "De",
        filterDateToLabel: "Até",
        tagsLabel: "Tags",
        tagsPlaceholder: "ex: financeiro, equipe",
        shareTitle: "Compartilhamento",
        shareSubtitle: "Controle quem pode ver seus eventos.",
        shareWithAllLabel: "Compartilhar com todos do workspace",
        shareAllowedUsersLabel: "Compartilhar apenas com",
        shareSave: "Salvar compartilhamento",
        shareSaving: "Salvando...",
        shareLastUpdated: "Atualizado em",
        shareLoadError: "Não foi possível carregar o compartilhamento.",
        shareSaveError: "Não foi possível salvar o compartilhamento.",
        shareNoMembers: "Nenhum membro disponível.",
        formTitle: "Novo evento",
        formDescription: "Crie eventos recorrentes, com ata e documentos anexos.",
        titleLabel: "Título",
        titlePlaceholder: "Ex: Reunião de diretoria",
        titleRequired: "Informe um título.",
        startLabel: "Início",
        startRequired: "Informe a data de início.",
        endLabel: "Fim",
        allDayLabel: "Evento de dia inteiro",
        documentOnlyLabel: "Evento apenas para documentos",
        documentOnlyTitle: "Evento de documentos",
        descriptionLabel: "Descrição",
        descriptionPlaceholder: "Resumo do evento",
        participantsLabel: "Participantes",
        selectUsersHint: "Selecione membros para participar.",
        documentsLabel: "Documentos do evento",
        documentsPlaceholder: "IDs dos documentos separados por vírgula",
        minutesTitle: "Ata",
        minutesLabel: "Texto da ata",
        minutesPlaceholder: "Notas e decisões da reunião",
        minutesDocumentsLabel: "Arquivos da ata",
        minutesDocumentsPlaceholder: "IDs dos documentos da ata",
        recurrenceTitle: "Recorrência",
        recurrenceEnable: "Definir recorrência",
        recurrenceFrequencyLabel: "Frequência",
        recurrenceIntervalLabel: "Intervalo",
        recurrenceWeekdaysLabel: "Dias da semana (0=Dom, 6=Sáb)",
        recurrenceMonthDaysLabel: "Dias do mês",
        recurrenceUntilLabel: "Repetir até",
        createAction: "Criar evento",
        creating: "Criando...",
        createError: "Não foi possível criar o evento.",
        deleteAction: "Excluir",
        deleteError: "Não foi possível excluir o evento.",
        listTitle: "Eventos",
        ownerLabel: "Responsável:",
        noEvents: "Nenhum evento encontrado.",
        tagsEmpty: "Sem tags",
        loading: "Carregando eventos...",
        loadError: "Não foi possível carregar os eventos.",
      },
      shareLastUpdated: string;
      shareLoadError: string;
      shareSaveError: string;
      shareNoMembers: string;
      formTitle: string;
      formDescription: string;
      titleLabel: string;
      titlePlaceholder: string;
      titleRequired: string;
      startLabel: string;
      startRequired: string;
      endLabel: string;
      allDayLabel: string;
      documentOnlyLabel: string;
      documentOnlyTitle: string;
      descriptionLabel: string;
      descriptionPlaceholder: string;
      participantsLabel: string;
      selectUsersHint: string;
      documentsLabel: string;
      documentsPlaceholder: string;
      minutesTitle: string;
      minutesLabel: string;
      minutesPlaceholder: string;
      minutesDocumentsLabel: string;
      minutesDocumentsPlaceholder: string;
      recurrenceTitle: string;
      recurrenceEnable: string;
      recurrenceFrequencyLabel: string;
      recurrenceIntervalLabel: string;
      recurrenceWeekdaysLabel: string;
      recurrenceMonthDaysLabel: string;
      recurrenceUntilLabel: string;
      createAction: string;
      creating: string;
      createError: string;
      deleteAction: string;
      deleteError: string;
      listTitle: string;
      ownerLabel: string;
      noEvents: string;
      tagsEmpty: string;
      loading: string;
      loadError: string;
    };
    sortLabel: string;
    sortUpdated: string;
    sortName: string;
    tableFile: string;
    tableFolder: string;
    tableType: string;
    tableUpdated: string;
    tableActions: string;
    open: string;
    empty: string;
    loadError: string;
    historyAction: string;
    historyTitle: string;
    fileLabel: string;
    noTags: string;
    close: string;
    cancel: string;
    save: string;
    saving: string;
    folderTitle: string;
    folderNameLabel: string;
    folderNamePlaceholder: string;
    folderDescriptionLabel: string;
    folderLabel: string;
    folderRequired: string;
    folderSaveError: string;
    folderRenameError: string;
    moveAction: string;
    moveTitle: string;
    moveLabel: string;
    moveConfirm: string;
    moveError: string;
    renameAction: string;
    renameTitle: string;
    renameConfirm: string;
    renameError: string;
    mentionAction: string;
    linkAction: string;
    deleteAction: string;
    deleteTitle: string;
    deleteConfirm: string;
    deleteError: string;
    linkTitle: string;
    linkModuleLabel: string;
    linkTypeLabel: string;
    linkIdLabel: string;
    linkTitleLabel: string;
    linkConfirm: string;
    linkError: string;
    uploadTitle: string;
    fileNameLabel: string;
    fileNamePlaceholder: string;
    fileRequired: string;
    fileNameRequired: string;
    uploadError: string;
    uploadAction: string;
    tagsLabel: string;
    tagsPlaceholder: string;
    descriptionLabel: string;
    page: string;
    pageOf: string;
    prev: string;
    next: string;
    references: {
      title: string;
      titleLabel: string;
      titlePlaceholder: string;
      titleRequired: string;
      mentionUsersLabel: string;
      mentionUsersPlaceholder: string;
      mentionSearchRequired: string;
      mentionSelectionRequired: string;
      mentionSearchAction: string;
      createAction: string;
      createError: string;
      empty: string;
      loadError: string;
      mentionedAt: string;
      scheduledAt: string;
      kindMention: string;
      kindScheduled: string;
      customModule: string;
    };
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
      filtersTitle: string;
      filterOwnersLabel: string;
      filterOwnersHint: string;
      filterDateFromLabel: string;
      filterDateToLabel: string;
      tagsLabel: string;
      tagsPlaceholder: string;
      shareTitle: string;
      shareSubtitle: string;
      shareWithAllLabel: string;
      shareAllowedUsersLabel: string;
      shareSave: string;
      shareSaving: string;
      shareLastUpdated: string;
      shareLoadError: string;
      shareSaveError: string;
      shareNoMembers: string;
      formTitle: string;
      formDescription: string;
      titleLabel: string;
      titlePlaceholder: string;
      titleRequired: string;
      startLabel: string;
      startRequired: string;
      endLabel: string;
      allDayLabel: string;
      documentOnlyLabel: string;
      documentOnlyTitle: string;
      descriptionLabel: string;
      descriptionPlaceholder: string;
      participantsLabel: string;
      selectUsersHint: string;
      documentsLabel: string;
      documentsPlaceholder: string;
      minutesTitle: string;
      minutesLabel: string;
      minutesPlaceholder: string;
      minutesDocumentsLabel: string;
      minutesDocumentsPlaceholder: string;
      recurrenceTitle: string;
      recurrenceEnable: string;
      recurrenceFrequencyLabel: string;
      recurrenceIntervalLabel: string;
      recurrenceWeekdaysLabel: string;
      recurrenceMonthDaysLabel: string;
      recurrenceUntilLabel: string;
      createAction: string;
      creating: string;
      createError: string;
      deleteAction: string;
      deleteError: string;
      listTitle: string;
      ownerLabel: string;
      noEvents: string;
      tagsEmpty: string;
      loading: string;
      loadError: string;
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
      filtersTitle: "Filtros",
      openFilters: "Filtros",
      openShare: "Compartilhar",
      openCreate: "Novo evento",
      monthLabel: "Mês",
      todayAction: "Hoje",
      prevMonthAction: "Mês anterior",
      nextMonthAction: "Próximo mês",
      closeAction: "Fechar",
      clearFilters: "Limpar filtros",
      dayEmpty: "Sem eventos",
      eventsCount: "{count} eventos",
      eventDetailsTitle: "Detalhes do evento",
      openFilters: "Filtros",
      openShare: "Compartilhar",
      openCreate: "Novo evento",
      monthLabel: "Mês",
      todayAction: "Hoje",
      prevMonthAction: "Mês anterior",
      nextMonthAction: "Próximo mês",
      closeAction: "Fechar",
      clearFilters: "Limpar filtros",
      dayEmpty: "Sem eventos",
      eventsCount: "{count} eventos",
      eventDetailsTitle: "Detalhes do evento",
      openFilters: "Filtros",
      openShare: "Compartilhar",
      openCreate: "Novo evento",
      monthLabel: "Mês",
      todayAction: "Hoje",
      prevMonthAction: "Mês anterior",
      nextMonthAction: "Próximo mês",
      closeAction: "Fechar",
      clearFilters: "Limpar filtros",
      dayEmpty: "Sem eventos",
      eventsCount: "{count} eventos",
      eventDetailsTitle: "Detalhes do evento",
      filterOwnersLabel: "Calendários visíveis",
      filterOwnersHint: "Selecione membros para filtrar. Sem seleção mostra tudo que você pode ver.",
      filterDateFromLabel: "De",
      filterDateToLabel: "Até",
      tagsLabel: "Tags",
      tagsPlaceholder: "ex: financeiro, equipe",
      shareTitle: "Compartilhamento",
      shareSubtitle: "Controle quem pode ver seus eventos.",
      shareWithAllLabel: "Compartilhar com todos do workspace",
      shareAllowedUsersLabel: "Compartilhar apenas com",
      shareSave: "Salvar compartilhamento",
      shareSaving: "Salvando...",
      shareLastUpdated: "Atualizado em",
      shareLoadError: "Não foi possível carregar o compartilhamento.",
      shareSaveError: "Não foi possível salvar o compartilhamento.",
      shareNoMembers: "Nenhum membro disponível.",
      formTitle: "Novo evento",
      formDescription: "Crie eventos recorrentes, com ata e documentos anexos.",
      titleLabel: "Título",
      titlePlaceholder: "Ex: Reunião de diretoria",
      titleRequired: "Informe um título.",
      startLabel: "Início",
      startRequired: "Informe a data de início.",
      endLabel: "Fim",
      allDayLabel: "Evento de dia inteiro",
      documentOnlyLabel: "Evento apenas para documentos",
      documentOnlyTitle: "Evento de documentos",
      descriptionLabel: "Descrição",
      descriptionPlaceholder: "Resumo do evento",
      participantsLabel: "Participantes",
      selectUsersHint: "Selecione membros para participar.",
      documentsLabel: "Documentos do evento",
      documentsPlaceholder: "IDs dos documentos separados por vírgula",
      minutesTitle: "Ata",
      minutesLabel: "Texto da ata",
      minutesPlaceholder: "Notas e decisões da reunião",
      minutesDocumentsLabel: "Arquivos da ata",
      minutesDocumentsPlaceholder: "IDs dos documentos da ata",
      recurrenceTitle: "Recorrência",
      recurrenceEnable: "Definir recorrência",
      recurrenceFrequencyLabel: "Frequência",
      recurrenceIntervalLabel: "Intervalo",
      recurrenceWeekdaysLabel: "Dias da semana (0=Dom, 6=Sáb)",
      recurrenceMonthDaysLabel: "Dias do mês",
      recurrenceUntilLabel: "Repetir até",
      createAction: "Criar evento",
      creating: "Criando...",
      createError: "Não foi possível criar o evento.",
      editAction: "Editar",
      deleteAction: "Excluir",
      deleteError: "Não foi possível excluir o evento.",
      listTitle: "Eventos",
      ownerLabel: "Responsável:",
      noEvents: "Nenhum evento encontrado.",
      tagsEmpty: "Sem tags",
      loading: "Carregando eventos...",
      loadError: "Não foi possível carregar os eventos.",
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
    openFilters: string;
    openShare: string;
    openCreate: string;
    monthLabel: string;
    todayAction: string;
    prevMonthAction: string;
    nextMonthAction: string;
    closeAction: string;
    clearFilters: string;
    dayEmpty: string;
    eventsCount: string;
    eventDetailsTitle: string;
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

*/
export const dictionaries = {
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
      members: "Membros",
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
      comingSoon: "Em breve",
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
    members: {
      title: "Membros",
      subtitle: "Gerencie pessoas e permissões do workspace.",
      manageAction: "Gerenciar membros",
      inviteAction: "Convidar membro",
      permissionsAction: "Permissões",
      searchPlaceholder: "Buscar por nome ou e-mail",
      filterAll: "Todos os cargos",
      tableName: "Membro",
      tableRole: "Permissões",
      tableEmail: "E-mail",
      tablePhone: "Telefone",
      tableStatus: "Status",
      loading: "Carregando membros...",
      empty: "Nenhum membro encontrado.",
      rolesEmpty: "Sem permissões",
      inviteTitle: "Convidar membro",
      inviteSubtitle: "Envie um convite para alguém entrar no workspace.",
      invitePlaceholder: "email@empresa.com",
      cancelAction: "Cancelar",
      saveAction: "Salvar",
      savingAction: "Salvando...",
      inviteError: "Não foi possível enviar o convite.",
      inviteSuccess: "Convite enviado com sucesso.",
      loadError: "Não foi possível carregar membros.",
      permissionsTitle: "Permissões do membro",
      permissionsSaveError: "Não foi possível salvar as permissões.",
      inviteBlocked: "Apenas admin e RH podem convidar.",
      permissionsBlocked: "Apenas admin e RH podem editar permissões.",
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
      foldersTitle: "Pastas",
      subfoldersTitle: "Árvore de pastas",
      filesTitle: "Arquivos",
      currentFolderLabel: "Pasta atual",
      folderRoot: "Raiz",
      folderParentLabel: "Pasta pai",
      dragHint: "Arraste documentos para mover entre pastas.",
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
      empty: "Nenhum documento encontrado.",
      loadError: "Não foi possível carregar os documentos.",
      historyAction: "Histórico",
      historyTitle: "Histórico de referências",
      fileLabel: "Arquivo",
      noTags: "Sem tags associadas.",
      close: "Fechar",
      cancel: "Cancelar",
      save: "Salvar",
      saving: "Salvando...",
      folderTitle: "Nova pasta",
      folderNameLabel: "Nome da pasta",
      folderNamePlaceholder: "Ex: Contratos",
      folderDescriptionLabel: "Descrição",
      folderLabel: "Pasta",
      folderRequired: "Informe o nome da pasta.",
      folderSaveError: "Não foi possível criar a pasta.",
      folderRenameError: "Não foi possível renomear a pasta.",
      moveAction: "Mover",
      moveTitle: "Mover documento",
      moveLabel: "Mover para",
      moveConfirm: "Mover",
      moveError: "Não foi possível mover o documento.",
      renameAction: "Renomear",
      renameTitle: "Renomear",
      renameConfirm: "Salvar",
      renameError: "Não foi possível renomear o item.",
      mentionAction: "Marcar alguém",
      linkAction: "Vincular módulo",
      deleteAction: "Excluir",
      deleteTitle: "Excluir",
      deleteConfirm: "Tem certeza que deseja excluir",
      deleteError: "Não foi possível excluir o item.",
      linkTitle: "Vincular a outro módulo",
      linkModuleLabel: "Módulo",
      linkTypeLabel: "Tipo",
      linkIdLabel: "ID",
      linkTitleLabel: "Título",
      linkConfirm: "Vincular",
      linkError: "Não foi possível vincular o documento.",
      uploadTitle: "Enviar arquivo",
      fileNameLabel: "Nome do arquivo",
      fileNamePlaceholder: "Ex: Nota fiscal janeiro",
      fileRequired: "Selecione um arquivo para enviar.",
      fileNameRequired: "Informe o nome do arquivo.",
      uploadError: "Não foi possível enviar o arquivo.",
      uploadAction: "Enviar",
      tagsLabel: "Tags",
      tagsPlaceholder: "Ex: financeiro, recorrente",
      descriptionLabel: "Descrição",
      page: "Página",
      pageOf: "de",
      prev: "Anterior",
      next: "Próximo",
      references: {
        title: "Referências",
        titleLabel: "Título",
        titlePlaceholder: "Ex: Menção manual",
        titleRequired: "Informe o título da referência.",
        mentionUsersLabel: "Buscar por e-mail",
        mentionUsersPlaceholder: "email@empresa.com",
        mentionSearchRequired: "Informe o e-mail para buscar.",
        mentionSelectionRequired: "Selecione ao menos um usuário.",
        mentionSearchAction: "Adicionar",
        createAction: "Adicionar menção",
        createError: "Não foi possível salvar a referência.",
        empty: "Ainda não há referências vinculadas.",
        loadError: "Não foi possível carregar o histórico.",
        mentionedAt: "Mencionado em",
        scheduledAt: "Próxima notificação",
        kindMention: "Menção",
        kindScheduled: "Agendado",
        customModule: "Outro módulo",
      },
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
      subtitle: "Organize lembretes, reuniões e prazos em um só lugar.",
      newEvent: "Novo evento",
      sidebarTitle: "Seus calendários",
      sidebarSubtitle: "Filtre eventos por pessoas e equipes.",
      filterModuleLabel: "Módulo",
      filterStatusLabel: "Status",
      filterAll: "Todos",
      statusPending: "Pendente",
      statusDone: "Concluído",
      monthTitle: "Visão mensal",
      monthSummary: "Confira eventos e compromissos do mês.",
      monthEventsTitle: "Eventos do mês",
      days: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
      events: {
        monthlyTaxes: "Impostos mensais",
        hrRecruitmentMeeting: "Reunião de recrutamento",
        renewDocument: "Renovar documento",
        updateCredentials: "Atualizar credenciais",
      },
      filtersTitle: "Filtros",
      viewDay: "Ver dia",
      dayViewTitle: "Visualização do dia",
      documentsLoading: "Carregando documentos...",
      documentsEmpty: "Nenhum documento na raiz.",
      sectionDetails: "Detalhes",
      sectionParticipants: "Participantes",
      sectionDocuments: "Documentos e ata",
      sectionRecurrence: "Recorrência",
      openFilters: "Filtros",
      openShare: "Compartilhar",
      openCreate: "Novo evento",
      filterOwnersAllLabel: "Todos os calendários",
      dayLabel: "Dia",
      weekLabel: "Semana",
      yearLabel: "Ano",
      daySummary: "Agenda do dia selecionado.",
      weekSummary: "Eventos da semana atual.",
      yearSummary: "Visão geral do ano.",
      viewDayTab: "Dia",
      viewWeekTab: "Semana",
      viewMonthTab: "Mês",
      viewYearTab: "Ano",
      monthLabel: "Mês",
      todayAction: "Hoje",
      prevDayAction: "Dia anterior",
      nextDayAction: "Próximo dia",
      prevWeekAction: "Semana anterior",
      nextWeekAction: "Próxima semana",
      prevMonthAction: "Mês anterior",
      nextMonthAction: "Próximo mês",
      prevYearAction: "Ano anterior",
      nextYearAction: "Próximo ano",
      closeAction: "Fechar",
      clearFilters: "Limpar filtros",
      dayEmpty: "Sem eventos",
      viewComingSoon: "Disponível em breve.",
      eventsCount: "{count} eventos",
      eventDetailsTitle: "Detalhes do evento",
      filterOwnersLabel: "Calendários visíveis",
      filterOwnersHint: "Selecione membros para filtrar. Sem seleção mostra tudo que você pode ver.",
      filterDateFromLabel: "De",
      filterDateToLabel: "Até",
      tagsLabel: "Tags",
      tagsPlaceholder: "ex: financeiro, equipe",
      shareTitle: "Compartilhamento",
      shareSubtitle: "Controle quem pode ver seus eventos.",
      shareWithAllLabel: "Compartilhar com todos do workspace",
      shareAllowedUsersLabel: "Compartilhar apenas com",
      shareSave: "Salvar compartilhamento",
      shareSaving: "Salvando...",
      shareLastUpdated: "Atualizado em",
      shareLoadError: "Não foi possível carregar o compartilhamento.",
      shareSaveError: "Não foi possível salvar o compartilhamento.",
      shareNoMembers: "Nenhum membro disponível.",
      formTitle: "Novo evento",
      formDescription: "Crie eventos recorrentes, com ata e documentos anexos.",
      titleLabel: "Título",
      titlePlaceholder: "Ex: Reunião de diretoria",
      titleRequired: "Informe um título.",
      startLabel: "Início",
      startRequired: "Informe a data de início.",
      endLabel: "Fim",
      allDayLabel: "Evento de dia inteiro",
      documentOnlyLabel: "Evento apenas para documentos",
      documentOnlyTitle: "Evento de documentos",
      descriptionLabel: "Descrição",
      descriptionPlaceholder: "Resumo do evento",
      participantsLabel: "Participantes",
      selectUsersHint: "Selecione membros para participar.",
      documentsLabel: "Documentos do evento",
      documentsPlaceholder: "IDs dos documentos separados por vírgula",
      minutesTitle: "Ata",
      minutesLabel: "Texto da ata",
      minutesPlaceholder: "Notas e decisões da reunião",
      minutesDocumentsLabel: "Arquivos da ata",
      minutesDocumentsPlaceholder: "IDs dos documentos da ata",
      recurrenceTitle: "Recorrência",
      recurrenceEnable: "Definir recorrência",
      recurrenceFrequencyLabel: "Frequência",
      recurrenceIntervalLabel: "Intervalo",
      recurrenceWeekdaysLabel: "Dias da semana (0=Dom, 6=Sáb)",
      recurrenceMonthDaysLabel: "Dias do mês",
      recurrenceUntilLabel: "Repetir até",
      createAction: "Criar evento",
      creating: "Criando...",
      createError: "Não foi possível criar o evento.",
      editAction: "Editar",
      deleteAction: "Excluir",
      deleteError: "Não foi possível excluir o evento.",
      listTitle: "Eventos",
      ownerLabel: "Responsável:",
      noEvents: "Nenhum evento encontrado.",
      tagsEmpty: "Sem tags",
      loading: "Carregando eventos...",
      loadError: "Não foi possível carregar os eventos.",
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
      members: "Members",
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
      comingSoon: "Coming soon",
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
    members: {
      title: "Members",
      subtitle: "Manage workspace people and permissions.",
      manageAction: "Manage members",
      inviteAction: "Invite member",
      permissionsAction: "Permissions",
      searchPlaceholder: "Search by name or email",
      filterAll: "All roles",
      tableName: "Member",
      tableRole: "Permissions",
      tableEmail: "Email",
      tablePhone: "Phone",
      tableStatus: "Status",
      loading: "Loading members...",
      empty: "No members found.",
      rolesEmpty: "No permissions",
      inviteTitle: "Invite member",
      inviteSubtitle: "Send an invite for someone to join the workspace.",
      invitePlaceholder: "email@company.com",
      cancelAction: "Cancel",
      saveAction: "Save",
      savingAction: "Saving...",
      inviteError: "Unable to send invite.",
      inviteSuccess: "Invite sent successfully.",
      loadError: "Unable to load members.",
      permissionsTitle: "Member permissions",
      permissionsSaveError: "Unable to save permissions.",
      inviteBlocked: "Only admin and HR can invite.",
      permissionsBlocked: "Only admin and HR can edit permissions.",
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
      foldersTitle: "Folders",
      subfoldersTitle: "Folder tree",
      filesTitle: "Files",
      currentFolderLabel: "Current folder",
      folderRoot: "Root",
      folderParentLabel: "Parent folder",
      dragHint: "Drag documents to move between folders.",
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
      empty: "No documents found.",
      loadError: "Unable to load documents.",
      historyAction: "History",
      historyTitle: "References history",
      fileLabel: "File",
      noTags: "No tags associated.",
      close: "Close",
      cancel: "Cancel",
      save: "Save",
      saving: "Saving...",
      folderTitle: "New folder",
      folderNameLabel: "Folder name",
      folderNamePlaceholder: "Ex: Contracts",
      folderDescriptionLabel: "Description",
      folderLabel: "Folder",
      folderRequired: "Provide a folder name.",
      folderSaveError: "Unable to create the folder.",
      folderRenameError: "Unable to rename the folder.",
      moveAction: "Move",
      moveTitle: "Move document",
      moveLabel: "Move to",
      moveConfirm: "Move",
      moveError: "Unable to move the document.",
      renameAction: "Rename",
      renameTitle: "Rename",
      renameConfirm: "Save",
      renameError: "Unable to rename the item.",
      mentionAction: "Mention someone",
      linkAction: "Link module",
      deleteAction: "Delete",
      deleteTitle: "Delete",
      deleteConfirm: "Are you sure you want to delete",
      deleteError: "Unable to delete the item.",
      linkTitle: "Link to another module",
      linkModuleLabel: "Module",
      linkTypeLabel: "Type",
      linkIdLabel: "ID",
      linkTitleLabel: "Title",
      linkConfirm: "Link",
      linkError: "Unable to link the document.",
      uploadTitle: "Upload file",
      fileNameLabel: "File name",
      fileNamePlaceholder: "Ex: January invoice",
      fileRequired: "Select a file to upload.",
      fileNameRequired: "Provide a file name.",
      uploadError: "Unable to upload the file.",
      uploadAction: "Upload",
      tagsLabel: "Tags",
      tagsPlaceholder: "Ex: finance, recurring",
      descriptionLabel: "Description",
      page: "Page",
      pageOf: "of",
      prev: "Previous",
      next: "Next",
      references: {
        title: "References",
        titleLabel: "Title",
        titlePlaceholder: "Ex: Manual mention",
        titleRequired: "Provide a reference title.",
        mentionUsersLabel: "Search by email",
        mentionUsersPlaceholder: "email@company.com",
        mentionSearchRequired: "Enter an email to search.",
        mentionSelectionRequired: "Select at least one user.",
        mentionSearchAction: "Add",
        createAction: "Add mention",
        createError: "Unable to save the reference.",
        empty: "No references linked yet.",
        loadError: "Unable to load the history.",
        mentionedAt: "Mentioned at",
        scheduledAt: "Next notification",
        kindMention: "Mention",
        kindScheduled: "Scheduled",
        customModule: "Other module",
      },
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
      subtitle: "Track reminders, meetings, and deadlines in one place.",
      newEvent: "New event",
      sidebarTitle: "Your calendars",
      sidebarSubtitle: "Filter events by people and teams.",
      filterModuleLabel: "Module",
      filterStatusLabel: "Status",
      filterAll: "All",
      statusPending: "Pending",
      statusDone: "Done",
      monthTitle: "Monthly view",
      monthSummary: "Check events and commitments for the month.",
      monthEventsTitle: "Month events",
      days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      events: {
        monthlyTaxes: "Monthly taxes",
        hrRecruitmentMeeting: "Recruitment meeting",
        renewDocument: "Renew document",
        updateCredentials: "Update credentials",
      },
      filtersTitle: "Filters",
      viewDay: "Day view",
      dayViewTitle: "Day view",
      documentsLoading: "Loading documents...",
      documentsEmpty: "No documents in root.",
      sectionDetails: "Details",
      sectionParticipants: "Participants",
      sectionDocuments: "Documents & minutes",
      sectionRecurrence: "Recurrence",
      openFilters: "Filters",
      openShare: "Share",
      openCreate: "New event",
      filterOwnersAllLabel: "All calendars",
      dayLabel: "Day",
      weekLabel: "Week",
      yearLabel: "Year",
      daySummary: "Schedule for the selected day.",
      weekSummary: "Events for the current week.",
      yearSummary: "Year overview.",
      viewDayTab: "Day",
      viewWeekTab: "Week",
      viewMonthTab: "Month",
      viewYearTab: "Year",
      monthLabel: "Month",
      todayAction: "Today",
      prevDayAction: "Previous day",
      nextDayAction: "Next day",
      prevWeekAction: "Previous week",
      nextWeekAction: "Next week",
      prevMonthAction: "Previous month",
      nextMonthAction: "Next month",
      prevYearAction: "Previous year",
      nextYearAction: "Next year",
      closeAction: "Close",
      clearFilters: "Clear filters",
      dayEmpty: "No events",
      viewComingSoon: "Available soon.",
      eventsCount: "{count} events",
      eventDetailsTitle: "Event details",
      filterOwnersLabel: "Visible calendars",
      filterOwnersHint: "Select members to filter. Empty selection shows everything you can view.",
      filterDateFromLabel: "From",
      filterDateToLabel: "To",
      tagsLabel: "Tags",
      tagsPlaceholder: "e.g. finance, team",
      shareTitle: "Sharing",
      shareSubtitle: "Control who can see your events.",
      shareWithAllLabel: "Share with everyone in the workspace",
      shareAllowedUsersLabel: "Share only with",
      shareSave: "Save sharing",
      shareSaving: "Saving...",
      shareLastUpdated: "Updated on",
      shareLoadError: "Unable to load sharing settings.",
      shareSaveError: "Unable to save sharing settings.",
      shareNoMembers: "No members available.",
      formTitle: "New event",
      formDescription: "Create recurring events with minutes and attachments.",
      titleLabel: "Title",
      titlePlaceholder: "Ex: Leadership meeting",
      titleRequired: "Provide a title.",
      startLabel: "Start",
      startRequired: "Provide a start date.",
      endLabel: "End",
      allDayLabel: "All-day event",
      documentOnlyLabel: "Document-only event",
      documentOnlyTitle: "Documents event",
      descriptionLabel: "Description",
      descriptionPlaceholder: "Event summary",
      participantsLabel: "Participants",
      selectUsersHint: "Select members to participate.",
      documentsLabel: "Event documents",
      documentsPlaceholder: "Document IDs separated by commas",
      minutesTitle: "Minutes",
      minutesLabel: "Minutes text",
      minutesPlaceholder: "Notes and decisions",
      minutesDocumentsLabel: "Minutes files",
      minutesDocumentsPlaceholder: "Minutes document IDs",
      recurrenceTitle: "Recurrence",
      recurrenceEnable: "Set recurrence",
      recurrenceFrequencyLabel: "Frequency",
      recurrenceIntervalLabel: "Interval",
      recurrenceWeekdaysLabel: "Weekdays (0=Sun, 6=Sat)",
      recurrenceMonthDaysLabel: "Month days",
      recurrenceUntilLabel: "Repeat until",
      createAction: "Create event",
      creating: "Creating...",
      createError: "Unable to create event.",
      editAction: "Edit",
      deleteAction: "Delete",
      deleteError: "Unable to delete event.",
      listTitle: "Events",
      ownerLabel: "Owner:",
      noEvents: "No events found.",
      tagsEmpty: "No tags",
      loading: "Loading events...",
      loadError: "Unable to load events.",
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

export type Dictionary = (typeof dictionaries)["pt"];
