// Re-export de componentes, pipes e outras funcionalidades da aplicação

// Pipes standalone
export * from './pipes/cpf.pipe';
export * from './pipes/phone.pipe';

// Material imports
export * from './material-imports';

// Utils compartilhados
export * from './utils/brazilian-paginator-intl';
export * from './utils/date-utils';

// Módulo compartilhado (será descontinuado em favor de componentes standalone)
// export * from './shared.module';
