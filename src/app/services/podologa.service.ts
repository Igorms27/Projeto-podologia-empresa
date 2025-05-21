import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, getDocs } from '@angular/fire/firestore';

import { Observable, of } from 'rxjs';

import { catchError, map } from 'rxjs/operators';

import { Podologa, Procedure } from '../models/appointment.model';

@Injectable({
  providedIn: 'root',
})
export class PodologaService {
  // Dados fictícios para demontração, caso não haja conexão com Firestore
  public podologasMock: Podologa[] = [
    {
      id: 'podologa1',
      nome: 'Valdenice',
      especialidade: 'Podologia Geral',
      especialidades: ['Podologia Geral', 'Tratamento de Micoses'],
      rating: 5,
    },
    {
      id: 'podologa2',
      nome: 'Claudia',
      especialidade: 'Podologia Esportiva',
      especialidades: ['Podologia Esportiva', 'Tratamento de Unhas Encravadas'],
      rating: 4.8,
    },
    {
      id: 'podologa3',
      nome: 'Sonia',
      especialidade: 'Podologia Geriátrica',
      especialidades: ['Podologia Geriátrica', 'Tratamento de Calosidades'],
      rating: 4.7,
    },
  ];

  // Procedimento padrão de retorno
  private procedimentoRetorno: Procedure = {
    id: 'return',
    name: 'Retorno/Reavaliação',
    description: 'Consulta de retorno para acompanhamento, reavaliação ou remoção de curativos',
    duration: 30,
    price: 40,
    category: 'Retorno',
  };

  constructor(private firestore: Firestore) {
    // Inicializar os dados de podólogas no Firestore, se necessário
    this.initializePodologasCollection();
  }

  /**
   * Inicializa a coleção de podólogas no Firestore se ela estiver vazia
   */
  async initializePodologasCollection(): Promise<void> {
    try {
      // Verificar se a coleção já tem dados
      const podologasCollection = collection(this.firestore, 'podologas');
      const snapshot = await getDocs(podologasCollection);

      // Se a coleção estiver vazia, adicionar os dados mockados
      if (snapshot.empty) {
        console.log('A coleção de podólogas está vazia. Inicializando com dados mockados...');

        // Adiciona cada podóloga ao Firestore
        for (const podologa of this.podologasMock) {
          // Remover o ID para que o Firestore gere um novo
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...podologaData } = podologa;

          try {
            await addDoc(podologasCollection, podologaData);
            console.log(`Podóloga ${podologa.nome} adicionada ao Firestore`);
          } catch (error) {
            console.error(`Erro ao adicionar podóloga ${podologa.nome}:`, error);
          }
        }

        console.log('Inicialização da coleção de podólogas concluída');
      } else {
        console.log('A coleção de podólogas já contém dados. Nenhuma inicialização necessária.');
      }
    } catch (error) {
      console.error('Erro ao inicializar a coleção de podólogas:', error);
    }
  }

  /**
   * Retorna todos os profissionais (podólogas) cadastrados
   */
  getAllPodologas(): Observable<Podologa[]> {
    try {
      console.log('Buscando podólogas do Firestore...');
      // Tentar buscar do Firestore
      const podologasCollection = collection(this.firestore, 'podologas');
      return collectionData(podologasCollection, { idField: 'id' }).pipe(
        map(data => {
          console.log('Dados retornados do Firestore:', data);
          // Se não há dados no Firestore, usar os dados mockados
          if (!data || data.length === 0) {
            console.log('Nenhuma podóloga encontrada no Firestore, usando dados mockados');
            return this.podologasMock;
          }
          return data as Podologa[];
        }),
        catchError(error => {
          console.error('Erro ao buscar podólogas do Firestore, usando dados mockados:', error);
          return of(this.podologasMock);
        })
      );
    } catch (error) {
      // Se o Firestore não estiver disponível, retorna dados mockados
      console.error('Firestore não disponível, usando dados mockados:', error);
      return of(this.podologasMock);
    }
  }

  /**
   * Obtém uma podóloga específica pelo ID
   */
  getPodologaById(id: string): Observable<Podologa | undefined> {
    return this.getAllPodologas().pipe(map(podologas => podologas.find(p => p.id === id)));
  }

  /**
   * Retorna o procedimento padrão de retorno
   */
  getProcedimentoRetorno(): Procedure {
    return this.procedimentoRetorno;
  }
}
