export type Language = "pt" | "en";

/*
export type Dictionary = {
  auth: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
      summaryIncome: "Income",
      summaryExpense: "Expenses",
      summaryNet: "Net",
      summaryAccounts: "Accounts",
    confirmPassword: string;
    login: string;
      newAccount: "+ New account",
    register: string;
      notificationsTitle: "Notifications",
      notificationsSubtitle: "Card alerts and finance updates.",
      notificationsEmpty: "No recent notifications.",
    google: string;
    goToRegister: string;
    goToLogin: string;
    emailRequired: string;
    passwordMin: string;
    passwordMismatch: string;
    remember: string;
    defaultModuleLabel: string;
      typeAll: "All",
      typeRequired: "Provide a type.",
  };
  layout: {
    dashboard: string;
    settings: string;
    profile: string;
    limits: string;
    back: string;
      titleLabel: "Title",
      titleRequired: "Provide a title.",
      amountLabel: "Amount",
      amountRequired: "Provide an amount.",
      dateLabel: "Date",
      dateRequired: "Provide a date.",
      accountLabel: "Account",
      accountAll: "All",
      accountTypeLabel: "Account type",
      accountRequired: "Provide an account.",
      descriptionLabel: "Description",
      tagsLabel: "Tags",
      tagsPlaceholder: "e.g. taxes, recurring",
      addTagAction: "Add tag",
      tagsEmpty: "No tags",
      listTitle: "Entries",
    newWorkspace: string;
    shareWorkspace: string;
    workspaceSettings: string;
    profileSettings: string;
    logout: string;
    finance: {
      subtitle: string;
      editAction: "Edit",
      deleteAction: "Delete",
      close: "Close",
      cancel: "Cancel",
      save: "Save",
      saving: "Saving...",
      newType: string;
      newTransaction: string;
      recurringTitle: string;
      typesTitle: string;
      searchLabel: string;
      recurrenceFrequencyLabel: "Frequency",
      searchPlaceholder: string;
      groupLabel: string;
      loading: "Loading finance data...",
      empty: "No entries found.",
      loadError: "Unable to load finance data.",
      saveError: "Unable to save.",
      deleteError: "Unable to delete.",
      tagError: "Unable to create tag.",
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
        emailInvalid: "Informe um email válido",
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
          emailInvalid: "Provide a valid email",
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
      forgotPassword: "Esqueceu sua senha?",
      forgotTitle: "Recuperar senha",
      forgotSubtitle: "Informe seu e-mail para receber o link de recuperação.",
      forgotAction: "Enviar e-mail",
      forgotSuccess: "Se o e-mail existir, enviaremos o link de recuperação.",
      resetTitle: "Redefinir senha",
      resetSubtitle: "Escolha uma nova senha para sua conta.",
      resetAction: "Redefinir senha",
      resetSuccess: "Senha redefinida com sucesso. Você já pode entrar.",
      resetInvalidToken: "Token inválido ou expirado.",
      backToLogin: "Voltar para o login",
      showPassword: "Mostrar",
      hidePassword: "Ocultar",
      emailRequired: "Informe um e-mail válido.",
      emailInvalid: "Informe um e-mail válido.",
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
      jobs: "Vagas",
      studies: "Estudos",
      calendar: "Calendário",
    },
    dashboard: {
      title: "Central",
      subtitle: "Tudo o que você precisa para acessar módulos, listas e chat.",
      centralModulesTitle: "Módulos",
      centralModulesSubtitle: "Acesse cada área e continue sua rotina.",
      centralModuleHint: "Entre no módulo e continue de onde parou.",
      centralModuleAction: "Abrir módulo",
      centralListsTitle: "Listas prontas",
      centralListsSubtitle: "Pré-listas para o dia e para o mês.",
      centralListsHint: "Itens não marcados vão para a próxima lista.",
      centralListsCarryover: "Não marcado? Vai para a próxima do dia.",
      centralListDaily: "Lista diária de supermercado",
      centralListMonthly: "Lista mensal de supermercado",
      centralListPharmacy: "Lista de farmácia",
      centralListAction: "Abrir lista",
      centralChatTitle: "Chat de listas",
      centralChatSubtitle: "Escreva ou envie áudio e a lista se atualiza.",
      centralChatHint: "Exemplo: adicionar detergente e leite.",
      centralChatExample: "Lista de supermercado\n- item 1\n- item 2",
      summaryFinanceTitle: "Finanças do mês",
      summaryFinanceSubtitle: "Movimento da conta principal",
      summaryFinanceIncome: "Receitas",
      summaryFinanceExpense: "Despesas",
      summaryListsTitle: "Listas",
      summaryListsSubtitle: "Total de listas ativas",
      summaryListsMeta: "Listas cadastradas",
      summarySecretsTitle: "Segredos",
      summarySecretsSubtitle: "Cofre do workspace",
      summarySecretsMeta: "Itens protegidos",
      summaryDocumentsTitle: "Documentos",
      summaryDocumentsSubtitle: "Atualizados recentemente",
      summaryEmpty: "Sem dados ainda",
      loadError: "Não foi possível carregar os dados do painel.",
      refreshAction: "Atualizar",
      summaryTitle: "Resumo do workspace",
      summarySubtitle: "Indicadores gerais com base nos dados do mês.",
      highlightTitle: "Destaques do dia",
      highlightSubtitle: "Resumo rápido das áreas com maior atividade.",
      reportsTitle: "Relatórios por módulo",
      reportsSubtitle: "Acesse detalhes completos em cada módulo.",
      totalLabel: "Total",
      viewModule: "Ver módulo",
      monthlyIncome: "Receitas do mês",
      monthlyExpense: "Despesas do mês",
      monthlyNet: "Saldo do mês",
      monthlyTransactions: "Transações no mês",
      activeModules: "Módulos ativos",
      financeBoardLabel: "Financeiro",
      financeBoardTitle: "Receitas x Despesas",
      financeBoardSubtitle: "Visão rápida do fluxo financeiro mensal.",
      financeChartLabel: "Últimos lançamentos",
      financeChartEmpty: "Sem lançamentos recentes.",
      calendarBoardLabel: "Calendário",
      calendarTodayTitle: "Agenda de hoje",
      calendarTodaySubtitle: "Eventos e lembretes do dia.",
      calendarTodayEmpty: "Nenhum evento hoje.",
      documentsTopTitle: "Documentos em destaque",
      documentsTopSubtitle: "Últimos documentos atualizados.",
      documentsTopEmpty: "Nenhum documento encontrado.",
      remindersLatestTitle: "Lembretes recentes",
      remindersLatestSubtitle: "Última lista atualizada.",
      remindersLatestEmpty: "Nenhum lembrete recente.",
      studiesTitle: "Estudos em progresso",
      studiesSubtitle: "Cursos ativos e entregas próximas.",
      studiesProgressLabel: "Progresso médio",
      studiesActiveLabel: "Cursos ativos",
      studiesDueLabel: "Entregas nos próximos 7 dias",
      hrRecentTitle: "RH - vagas recentes",
      hrRecentSubtitle: "Novas vagas internas registradas.",
      hrRecentEmpty: "Nenhuma vaga interna recente.",
      jobsRecentTitle: "Vagas externas recentes",
      jobsRecentSubtitle: "Novas oportunidades cadastradas.",
      jobsRecentEmpty: "Nenhuma vaga recente.",
      recentSinceLabel: "Últimos 30 dias",
      lastUpdatedLabel: "Atualizado em",
      reports: {
        reminders: "Listas ativas",
        documents: "Documentos cadastrados",
        calendar: "Eventos no mês",
        secrets: "Segredos protegidos",
        finance: "Lançamentos financeiros",
        studies: "Cursos em andamento",
        hrPeople: "Pessoas registradas",
        hrJobs: "Vagas internas",
        jobs: "Vagas publicadas",
      },
    },
    hr: {
      title: "RH",
      subtitle: "Gerencie pessoas e vagas internas do workspace.",
      peopleTitle: "Pessoas",
      peopleSubtitle: "Cadastre informações dos colaboradores.",
      peopleLinkHint: "Pessoas podem ou não estar vinculadas a usuários do sistema.",
      jobsTitle: "Vagas internas",
      jobsSubtitle: "Crie oportunidades internas e acompanhe participantes.",
      createPerson: "Cadastrar pessoa",
      createJob: "Cadastrar vaga",
      closeAction: "Fechar",
      deleteAction: "Remover",
      participantTitle: "Participantes",
      participantEmpty: "Sem participantes ainda.",
      participantAdd: "Adicionar participante",
      participantSelect: "Selecionar participante",
      participantRefresh: "Atualizar",
      participantInvalid: "Selecione um participante válido.",
      participantSelectRequired: "Selecione um participante.",
      loading: "Carregando...",
      peopleEmpty: "Nenhuma pessoa cadastrada.",
      jobsEmpty: "Nenhuma vaga cadastrada.",
      loadError: "Não foi possível carregar os dados de RH.",
      saveError: "Não foi possível salvar.",
      deleteError: "Não foi possível remover.",
      validationName: "Informe um nome com pelo menos 2 caracteres.",
      validationEmail: "Informe um email válido.",
      cards: {
        totalLabel: "Total",
        peopleDescription: "Veja e gerencie as pessoas cadastradas.",
        jobsDescription: "Acompanhe vagas internas e participantes.",
        viewPeople: "Ver pessoas",
        viewJobs: "Ver vagas",
      },
      form: {
        fullName: "Nome completo",
        email: "Email",
        roleTitle: "Cargo",
        department: "Departamento",
        phone: "Telefone",
        notes: "Observações",
        jobTitle: "Título da vaga",
        jobDepartment: "Área",
        jobLocation: "Local",
        jobDescription: "Descrição",
      },
    },
    jobs: {
      title: "Vagas",
      subtitle: "Salve oportunidades e organize o currículo.",
      listTitle: "Oportunidades",
      resumeTitle: "Currículo",
      createJob: "Adicionar vaga",
      saveResume: "Salvar currículo",
      closeAction: "Fechar",
      loading: "Carregando vagas...",
      empty: "Nenhuma vaga salva.",
      loadError: "Não foi possível carregar suas vagas.",
      saveError: "Não foi possível salvar.",
      deleteAction: "Remover",
      statusLabel: "Status",
      status: {
        saved: "Salva",
        applied: "Aplicada",
        interview: "Entrevista",
        offer: "Proposta",
        rejected: "Recusada",
      },
      form: {
        title: "Título",
        company: "Empresa",
        location: "Local",
        url: "Link",
        source: "Fonte",
        notes: "Notas",
        resumeTitle: "Título do currículo",
        summary: "Resumo",
        experience: "Experiência",
        education: "Formação",
        skills: "Skills",
        links: "Links (um por linha: Título - URL)",
      },
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
      documentsFiles: "Arquivos de documentos",
      remindersLists: "Listas de lembretes",
      secretsRecords: "Registros de segredos",
      financeAccounts: "Contas financeiras",
      calendarIntegrations: "Integrações de calendário",
      integrations: "Integrações",
      integrationsEnabled: "Ativo",
      integrationsBlocked: "Bloqueado",
      businessRules: "Regras de negócio",
      membersDescription: "Quantidade máxima de membros ativos no workspace.",
      workspacesDescription: "Total de workspaces permitidos para o plano.",
      storageDescription: "Espaço total disponível para arquivos e documentos.",
      documentsFilesDescription: "Quantidade máxima de documentos armazenados.",
      remindersListsDescription: "Quantidade de listas de lembretes permitidas.",
      secretsRecordsDescription: "Total de segredos cadastrados no workspace.",
      financeAccountsDescription: "Total de contas financeiras permitidas.",
      calendarIntegrationsDescription: "Integrações externas disponíveis para o calendário.",
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
      summaryIncome: "Receitas",
      summaryExpense: "Despesas",
      summaryNet: "Saldo",
      summaryAccounts: "Contas",
      monthTitle: "Contas por mês",
      monthSummary: "Resumo mensal por conta",
      monthEventsTitle: "Lançamentos do mês",
      cardsTitle: "Cartões",
      cardsSubtitle: "Selecione um cartão para ver detalhes",
      balanceLabel: "Saldo",
      accountsTitle: "Contas",
      accountsSubtitle: "Total",
      newType: "+ Novo tipo",
      newTransaction: "+ Nova transação",
      newAccount: "+ Nova conta",
      paymentMethodsTitle: "Métodos de pagamento",
      paymentMethodAdd: "Adicionar",
      paymentMethodEmpty: "Nenhum método cadastrado.",
      paymentMethodTitle: "Novo cartão",
      paymentMethodNameLabel: "Nome do cartão",
      paymentMethodNameRequired: "Informe o nome do cartão.",
      paymentMethodTypeLabel: "Tipo",
      paymentMethodAccountLabel: "Conta vinculada",
      paymentMethodLimitLabel: "Limite",
      paymentMethodClosingDayLabel: "Fechamento (dia)",
      paymentMethodDueDayLabel: "Vencimento (dia)",
      paymentMethodCredit: "Crédito",
      paymentMethodDebit: "Débito",
      paymentMethodPix: "Pix",
      paymentMethodCash: "Dinheiro",
      paymentMethodInvest: "Investimento",
      paymentMethodCard: "Cartão",
      cardDetailsTitle: "Detalhes do cartão",
      cardTransactionsTitle: "Transações do mês",
      cardTransactionsSubtitle: "Detalhes do período selecionado",
      cardTransactionsEmpty: "Nenhuma despesa neste mês.",
      currencyLabel: "Moeda",
      recurringTitle: "Checklist de contas recorrentes",
      recurringLabel: "Transação recorrente",
      addToCalendarLabel: "Adicionar recorrência ao calendário",
      recurrenceTabLabel: "Recorrência",
      notificationsTitle: "Notificações",
      notificationsSubtitle: "Alertas dos cartões e avisos financeiros.",
      notificationsEmpty: "Nenhuma notificação recente.",
      typesTitle: "Tipos financeiros",
      searchLabel: "Buscar",
      searchPlaceholder: "Pesquisar transações",
      groupLabel: "Grupo",
      groupAll: "Todos",
      groupIncome: "Receita",
      groupExpense: "Despesa",
      typeLabel: "Tipo",
      typeAll: "Todos",
      typeRequired: "Informe um tipo.",
      statusLabel: "Status",
      statusAll: "Todos",
      statusPaid: "Pago",
      statusPending: "Pendente",
      sortLabel: "Ordenar",
      sortDate: "Data",
      sortAmount: "Valor",
      titleLabel: "Título",
      titleRequired: "Informe um título.",
      amountLabel: "Valor",
      amountRequired: "Informe um valor.",
      dateLabel: "Data",
      dateRequired: "Informe uma data.",
      accountLabel: "Conta",
      accountAll: "Todas",
      accountUnknown: "Conta desconhecida",
      accountTypeLabel: "Tipo de conta",
      accountRequired: "Informe uma conta.",
      methodLabel: "Método de pagamento",
      none: "Nenhum",
      creditTitle: "Cartões de crédito",
      billSubtitle: "Acompanhe a fatura atual",
      billTitle: "Pagamento de fatura",
      billAmountLabel: "Valor da fatura",
      billPay: "Pagar",
      billDue: "Vencimento",
      billLoading: "Carregando fatura...",
      billRemaining: "Saldo",
      investmentsTitle: "Investimentos",
      investmentsSubtitle: "Saldo separado da conta",
      investmentsTransfer: "Transferir investimentos",
      investmentFrom: "De",
      investmentTo: "Para",
      transfer: "Transferir",
      descriptionLabel: "Descrição",
      tagsLabel: "Tags",
      tagsPlaceholder: "ex: impostos, recorrente",
      addTagAction: "Adicionar tag",
      tagsEmpty: "Sem tags",
      listTitle: "Lançamentos",
      tableTitle: "Título",
      tableType: "Tipo",
      tableDate: "Data",
      tableAmount: "Valor",
      tableStatus: "Status",
      tableActions: "Ações",
      details: "Detalhes",
      editAction: "Editar",
      deleteAction: "Excluir",
      deleteAccountConfirm: "Deseja excluir esta conta?",
      deletePaymentMethodConfirm: "Deseja excluir este cartão?",
      close: "Fechar",
      cancel: "Cancelar",
      save: "Salvar",
      saving: "Salvando...",
      page: "Página",
      pageOf: "de",
      showing: "Exibindo",
      of: "de",
      loadMore: "Carregar mais",
      prev: "Anterior",
      next: "Próximo",
      nextDueLabel: "Próx:",
      recurrenceFrequencyLabel: "Frequência",
      cadenceMonthly: "Mensal",
      cadenceQuarterly: "Trimestral",
      cadenceDaily: "Diária",
      cadenceWeekly: "Semanal",
      cadenceYearly: "Anual",
      loading: "Carregando finanças...",
      empty: "Nenhum lançamento encontrado.",
      loadError: "Não foi possível carregar as finanças.",
      saveError: "Não foi possível salvar.",
      deleteError: "Não foi possível excluir.",
      tagError: "Não foi possível criar a tag.",
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
    studies: {
      subtitle: "Acompanhe cursos, tarefas, leituras e projetos de estudo.",
      dashboardTitle: "Dashboard",
      searchPlaceholder: "Buscar",
      newCourseAction: "Novo curso",
      newCoursesTitle: "Novos cursos",
      viewAll: "Ver tudo",
      lessonsLabel: "aulas",
      myCoursesTitle: "Meus cursos",
      courseNameLabel: "Curso",
      courseStartLabel: "Início",
      courseProgressLabel: "Progresso",
      courseStatusLabel: "Status",
      courseTitleLabel: "Título do curso",
      courseProviderLabel: "Instituição",
      courseLessonCountLabel: "Qtd. de aulas",
      premiumTitle: "Assinatura premium",
      premiumSubtitle: "Assine para desbloquear novos cursos.",
      premiumAction: "Mais detalhes",
      profileRole: "Elementar",
      profileFallback: "Perfil",
      editProfile: "Editar perfil",
      calendarTitle: "Calendário",
      viewCalendarAction: "Abrir",
      calendarWeekdays: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
      homeworkTitle: "Progresso de tarefas",
      tasksLabel: "tarefas",
      statusActive: "Ativo",
      statusPaused: "Pausado",
      statusCompleted: "Concluído",
      actionsLabel: "Ações",
      editAction: "Editar",
      editCourseTitle: "Editar curso",
      createAction: "Criar",
      updateAction: "Salvar",
      cancelAction: "Cancelar",
      saving: "Salvando...",
      newCourseFormTitle: "Cadastrar novo curso",
      taskTitleLabel: "Título da tarefa",
      taskDueLabel: "Prazo",
      taskCourseLabel: "Curso",
      taskCreateAction: "Criar tarefa",
      taskStatusOpen: "Em aberto",
      taskStatusDone: "Concluída",
      emptyCourses: "Nenhum curso cadastrado.",
      emptyTasks: "Nenhuma tarefa encontrada.",
      loadError: "Não foi possível carregar os estudos.",
      saveError: "Não foi possível salvar.",
      loading: "Carregando estudos...",
      unassignedCourseLabel: "Sem curso",
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
      creating: "Criando...",
      cancel: "Cancelar",
      editList: "Editar lista",
      listSettings: "Configurações",
      deleteList: "Excluir lista",
      deleteItem: "Excluir item",
      confirmDeleteList: "Tem certeza que deseja excluir esta lista?",
      confirmDeleteItem: "Tem certeza que deseja excluir este item?",
      loading: "Carregando listas...",
      loadError: "Não foi possível carregar os lembretes.",
      createError: "Não foi possível criar a lista.",
      saveError: "Não foi possível salvar o lembrete.",
      updateError: "Não foi possível atualizar o lembrete.",
      presetTitle: "Preencha os itens da lista",
      presetListFallback: "Lista pronta",
      presetItemLabel: "Item",
      presetSave: "Salvar itens",
      presetError: "Adicione pelo menos um item.",
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
      forgotPassword: "Forgot your password?",
      forgotTitle: "Reset password",
      forgotSubtitle: "Enter your email to receive the reset link.",
      forgotAction: "Send email",
      forgotSuccess: "If the email exists, we will send the reset link.",
      resetTitle: "Create a new password",
      resetSubtitle: "Choose a new password for your account.",
      resetAction: "Reset password",
      resetSuccess: "Password reset successfully. You can sign in now.",
      resetInvalidToken: "Invalid or expired token.",
      backToLogin: "Back to login",
      showPassword: "Show",
      hidePassword: "Hide",
      emailRequired: "Please enter a valid email.",
      emailInvalid: "Please enter a valid email.",
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
      jobs: "Jobs",
      studies: "Studies",
      calendar: "Calendar",
    },
    dashboard: {
      title: "Central",
      subtitle: "Your hub to access modules, lists, and chat.",
      centralModulesTitle: "Modules",
      centralModulesSubtitle: "Jump into each area and keep momentum.",
      centralModuleHint: "Open the module and pick up where you left off.",
      centralModuleAction: "Open module",
      centralListsTitle: "Preset lists",
      centralListsSubtitle: "Daily and monthly starter lists.",
      centralListsHint: "Unchecked items roll into the next list.",
      centralListsCarryover: "Unchecked items roll to the next day.",
      centralListDaily: "Daily grocery list",
      centralListMonthly: "Monthly grocery list",
      centralListPharmacy: "Pharmacy list",
      centralListAction: "Open list",
      centralChatTitle: "List chat",
      centralChatSubtitle: "Type or send audio to update lists.",
      centralChatHint: "Example: add detergent and milk.",
      centralChatExample: "Grocery list\n- item 1\n- item 2",
      summaryFinanceTitle: "Monthly finance",
      summaryFinanceSubtitle: "Main account activity",
      summaryFinanceIncome: "Income",
      summaryFinanceExpense: "Expenses",
      summaryListsTitle: "Lists",
      summaryListsSubtitle: "Active lists total",
      summaryListsMeta: "Registered lists",
      summarySecretsTitle: "Secrets",
      summarySecretsSubtitle: "Workspace vault",
      summarySecretsMeta: "Protected items",
      summaryDocumentsTitle: "Documents",
      summaryDocumentsSubtitle: "Recently updated",
      summaryEmpty: "No data yet",
      loadError: "Unable to load dashboard data.",
      refreshAction: "Refresh",
      summaryTitle: "Workspace summary",
      summarySubtitle: "Overall indicators based on this month.",
      highlightTitle: "Highlights",
      highlightSubtitle: "Quick view of the most active areas.",
      reportsTitle: "Module reports",
      reportsSubtitle: "Open each module for detailed insights.",
      totalLabel: "Total",
      viewModule: "View module",
      monthlyIncome: "Monthly income",
      monthlyExpense: "Monthly expense",
      monthlyNet: "Monthly net",
      monthlyTransactions: "Monthly transactions",
      activeModules: "Active modules",
      financeBoardLabel: "Finance",
      financeBoardTitle: "Income vs Expense",
      financeBoardSubtitle: "Quick view of monthly cash flow.",
      financeChartLabel: "Latest entries",
      financeChartEmpty: "No recent entries.",
      calendarBoardLabel: "Calendar",
      calendarTodayTitle: "Today schedule",
      calendarTodaySubtitle: "Events and reminders for today.",
      calendarTodayEmpty: "No events today.",
      documentsTopTitle: "Top documents",
      documentsTopSubtitle: "Most recently updated documents.",
      documentsTopEmpty: "No documents yet.",
      remindersLatestTitle: "Recent reminders",
      remindersLatestSubtitle: "Last updated list.",
      remindersLatestEmpty: "No recent reminders.",
      studiesTitle: "Studies in progress",
      studiesSubtitle: "Active courses and upcoming deliveries.",
      studiesProgressLabel: "Average progress",
      studiesActiveLabel: "Active courses",
      studiesDueLabel: "Due in the next 7 days",
      hrRecentTitle: "HR - recent openings",
      hrRecentSubtitle: "New internal openings added.",
      hrRecentEmpty: "No recent internal openings.",
      jobsRecentTitle: "Recent jobs",
      jobsRecentSubtitle: "New opportunities added.",
      jobsRecentEmpty: "No recent jobs.",
      recentSinceLabel: "Last 30 days",
      lastUpdatedLabel: "Updated on",
      reports: {
        reminders: "Active lists",
        documents: "Stored documents",
        calendar: "Events this month",
        secrets: "Protected secrets",
        finance: "Financial entries",
        studies: "Courses in progress",
        hrPeople: "People registered",
        hrJobs: "Internal openings",
        jobs: "Published jobs",
      },
    },
    hr: {
      title: "HR",
      subtitle: "Manage people and internal openings in the workspace.",
      peopleTitle: "People",
      peopleSubtitle: "Register employee information.",
      peopleLinkHint: "People may or may not be linked to system users.",
      jobsTitle: "Internal openings",
      jobsSubtitle: "Create internal opportunities and track participants.",
      createPerson: "Add person",
      createJob: "Add opening",
      closeAction: "Close",
      deleteAction: "Remove",
      participantTitle: "Participants",
      participantEmpty: "No participants yet.",
      participantAdd: "Add participant",
      participantSelect: "Select participant",
      participantRefresh: "Refresh",
      participantInvalid: "Select a valid participant.",
      participantSelectRequired: "Select a participant.",
      loading: "Loading...",
      peopleEmpty: "No people added yet.",
      jobsEmpty: "No openings yet.",
      loadError: "Unable to load HR data.",
      saveError: "Unable to save.",
      deleteError: "Unable to remove.",
      validationName: "Provide a name with at least 2 characters.",
      validationEmail: "Provide a valid email.",
      cards: {
        totalLabel: "Total",
        peopleDescription: "View and manage registered people.",
        jobsDescription: "Track internal openings and participants.",
        viewPeople: "View people",
        viewJobs: "View openings",
      },
      form: {
        fullName: "Full name",
        email: "Email",
        roleTitle: "Role",
        department: "Department",
        phone: "Phone",
        notes: "Notes",
        jobTitle: "Job title",
        jobDepartment: "Department",
        jobLocation: "Location",
        jobDescription: "Description",
      },
    },
    jobs: {
      title: "Jobs",
      subtitle: "Save opportunities and keep your resume organized.",
      listTitle: "Opportunities",
      resumeTitle: "Resume",
      createJob: "Add job",
      saveResume: "Save resume",
      closeAction: "Close",
      loading: "Loading jobs...",
      empty: "No jobs saved yet.",
      loadError: "Unable to load jobs.",
      saveError: "Unable to save.",
      deleteAction: "Remove",
      statusLabel: "Status",
      status: {
        saved: "Saved",
        applied: "Applied",
        interview: "Interview",
        offer: "Offer",
        rejected: "Rejected",
      },
      form: {
        title: "Title",
        company: "Company",
        location: "Location",
        url: "Link",
        source: "Source",
        notes: "Notes",
        resumeTitle: "Resume title",
        summary: "Summary",
        experience: "Experience",
        education: "Education",
        skills: "Skills",
        links: "Links (one per line: Title - URL)",
      },
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
      documentsFiles: "Document files",
      remindersLists: "Reminder lists",
      secretsRecords: "Secret records",
      financeAccounts: "Finance accounts",
      calendarIntegrations: "Calendar integrations",
      integrations: "Integrations",
      integrationsEnabled: "Enabled",
      integrationsBlocked: "Blocked",
      businessRules: "Business rules",
      membersDescription: "Maximum active members allowed in the workspace.",
      workspacesDescription: "Total workspaces allowed for the plan.",
      storageDescription: "Total space available for files and documents.",
      documentsFilesDescription: "Maximum number of stored documents.",
      remindersListsDescription: "Total reminder lists allowed.",
      secretsRecordsDescription: "Total secrets stored in the workspace.",
      financeAccountsDescription: "Total finance accounts allowed.",
      calendarIntegrationsDescription: "External calendar integrations available.",
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
      summaryIncome: "Income",
      summaryExpense: "Expenses",
      summaryNet: "Net",
      summaryAccounts: "Accounts",
      monthTitle: "Accounts by month",
      monthSummary: "Monthly summary by account",
      monthEventsTitle: "Month transactions",
      cardsTitle: "Cards",
      cardsSubtitle: "Select a card to see details",
      balanceLabel: "Balance",
      accountsTitle: "Accounts",
      accountsSubtitle: "Total",
      newType: "+ New type",
      newTransaction: "+ New transaction",
      newAccount: "+ New account",
      paymentMethodsTitle: "Payment methods",
      paymentMethodAdd: "Add",
      paymentMethodEmpty: "No payment methods yet.",
      paymentMethodTitle: "New card",
      paymentMethodNameLabel: "Card name",
      paymentMethodNameRequired: "Provide a card name.",
      paymentMethodTypeLabel: "Type",
      paymentMethodAccountLabel: "Linked account",
      paymentMethodLimitLabel: "Limit",
      paymentMethodClosingDayLabel: "Closing day",
      paymentMethodDueDayLabel: "Due day",
      paymentMethodCredit: "Credit",
      paymentMethodDebit: "Debit",
      paymentMethodPix: "Pix",
      paymentMethodCash: "Cash",
      paymentMethodInvest: "Investment",
      paymentMethodCard: "Card",
      cardDetailsTitle: "Card details",
      cardTransactionsTitle: "Month transactions",
      cardTransactionsSubtitle: "Details for the selected period",
      cardTransactionsEmpty: "No transactions this month.",
      currencyLabel: "Currency",
      recurringTitle: "Recurring bills checklist",
      recurringLabel: "Recurring transaction",
      addToCalendarLabel: "Add recurrence to calendar",
      recurrenceTabLabel: "Recurrence",
      notificationsTitle: "Notifications",
      notificationsSubtitle: "Card alerts and finance updates.",
      notificationsEmpty: "No recent notifications.",
      typesTitle: "Finance types",
      searchLabel: "Search",
      searchPlaceholder: "Search transactions",
      groupLabel: "Group",
      groupAll: "All",
      groupIncome: "Income",
      groupExpense: "Expense",
      typeLabel: "Type",
      typeAll: "All",
      typeRequired: "Provide a type.",
      statusLabel: "Status",
      statusAll: "All",
      statusPaid: "Paid",
      statusPending: "Pending",
      sortLabel: "Sort",
      sortDate: "Date",
      sortAmount: "Amount",
      titleLabel: "Title",
      titleRequired: "Provide a title.",
      amountLabel: "Amount",
      amountRequired: "Provide an amount.",
      dateLabel: "Date",
      dateRequired: "Provide a date.",
      accountLabel: "Account",
      accountAll: "All",
      accountUnknown: "Unknown account",
      accountTypeLabel: "Account type",
      accountRequired: "Provide an account.",
      methodLabel: "Payment method",
      none: "None",
      creditTitle: "Credit cards",
      billSubtitle: "Track the current bill",
      billTitle: "Bill payment",
      billAmountLabel: "Bill amount",
      billPay: "Pay",
      billDue: "Due",
      billLoading: "Loading bill...",
      billRemaining: "Remaining",
      investmentsTitle: "Investments",
      investmentsSubtitle: "Separate balance from account",
      investmentsTransfer: "Transfer investments",
      investmentFrom: "From",
      investmentTo: "To",
      transfer: "Transfer",
      descriptionLabel: "Description",
      tagsLabel: "Tags",
      tagsPlaceholder: "e.g. taxes, recurring",
      addTagAction: "Add tag",
      tagsEmpty: "No tags",
      listTitle: "Entries",
      tableTitle: "Title",
      tableType: "Type",
      tableDate: "Date",
      tableAmount: "Amount",
      tableStatus: "Status",
      tableActions: "Actions",
      details: "Details",
      editAction: "Edit",
      deleteAction: "Delete",
      deleteAccountConfirm: "Delete this account?",
      deletePaymentMethodConfirm: "Delete this card?",
      close: "Close",
      cancel: "Cancel",
      save: "Save",
      saving: "Saving...",
      page: "Page",
      pageOf: "of",
      showing: "Showing",
      of: "of",
      loadMore: "Load more",
      prev: "Previous",
      next: "Next",
      nextDueLabel: "Next:",
      recurrenceFrequencyLabel: "Frequency",
      cadenceMonthly: "Monthly",
      cadenceQuarterly: "Quarterly",
      cadenceDaily: "Daily",
      cadenceWeekly: "Weekly",
      cadenceYearly: "Yearly",
      loading: "Loading finance data...",
      empty: "No entries found.",
      loadError: "Unable to load finance data.",
      saveError: "Unable to save.",
      deleteError: "Unable to delete.",
      tagError: "Unable to create tag.",
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
    studies: {
      subtitle: "Track courses, tasks, readings, and study projects.",
      dashboardTitle: "Dashboard",
      searchPlaceholder: "Search",
      newCourseAction: "New course",
      newCoursesTitle: "New courses",
      viewAll: "View all",
      lessonsLabel: "lessons",
      myCoursesTitle: "My courses",
      courseNameLabel: "Course",
      courseStartLabel: "Start",
      courseProgressLabel: "Progress",
      courseStatusLabel: "Status",
      courseTitleLabel: "Course title",
      courseProviderLabel: "Institution",
      courseLessonCountLabel: "Lessons",
      premiumTitle: "Premium subscription",
      premiumSubtitle: "Subscribe to unlock new courses.",
      premiumAction: "More details",
      profileRole: "Elementary",
      profileFallback: "Profile",
      editProfile: "Edit profile",
      calendarTitle: "Calendar",
      viewCalendarAction: "Open",
      calendarWeekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      homeworkTitle: "Homework progress",
      tasksLabel: "tasks",
      statusActive: "Active",
      statusPaused: "Paused",
      statusCompleted: "Completed",
      actionsLabel: "Actions",
      editAction: "Edit",
      editCourseTitle: "Edit course",
      createAction: "Create",
      updateAction: "Save",
      cancelAction: "Cancel",
      saving: "Saving...",
      newCourseFormTitle: "Add new course",
      taskTitleLabel: "Task title",
      taskDueLabel: "Due date",
      taskCourseLabel: "Course",
      taskCreateAction: "Create task",
      taskStatusOpen: "Open",
      taskStatusDone: "Done",
      emptyCourses: "No courses found.",
      emptyTasks: "No tasks found.",
      loadError: "Unable to load studies.",
      saveError: "Unable to save.",
      loading: "Loading studies...",
      unassignedCourseLabel: "Unassigned",
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
      creating: "Creating...",
      cancel: "Cancel",
      editList: "Edit list",
      listSettings: "Settings",
      deleteList: "Delete list",
      deleteItem: "Delete item",
      confirmDeleteList: "Are you sure you want to delete this list?",
      confirmDeleteItem: "Are you sure you want to delete this item?",
      loading: "Loading lists...",
      loadError: "Unable to load reminders.",
      createError: "Unable to create the list.",
      saveError: "Unable to save reminder.",
      updateError: "Unable to update reminder.",
      presetTitle: "Fill in the list items",
      presetListFallback: "Quick list",
      presetItemLabel: "Item",
      presetSave: "Save items",
      presetError: "Add at least one item.",
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
