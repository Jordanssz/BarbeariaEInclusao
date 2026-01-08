import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor() {}
}

export function formatarEnderecoSimples(enderecoCompleto: string | undefined): string {
    if (!enderecoCompleto) {
        return 'Endereço não informado';
    }

    // 1. Divide a string completa por vírgula.
    const partes = enderecoCompleto.split(',');
    
    // 2. O endereço que você deseja manter (Rua, Bairro, Cidade) geralmente está nas 3 primeiras posições.
    // Usaremos as três primeiras partes para garantir que a rua, o bairro e a cidade sejam incluídos.
    // Se a string for menor que 3 partes (o que é raro para um endereço completo), usamos o que tiver.
    let partesRelevantes: string[] = [];

    // Tenta pegar pelo menos as 3 primeiras partes (Rua, Bairro, Cidade)
    const limitePartes = Math.min(partes.length, 3);
    for (let i = 0; i < limitePartes; i++) {
        partesRelevantes.push(partes[i].trim());
    }

    // 3. Verifica se existe a parte de "Região Geográfica" e a ignora
    const indiceRegiao = partes.findIndex(parte => parte.toLowerCase().includes('região geográfica'));

    // Se a parte relevante for menor que 3 e a região não foi encontrada, podemos tentar pegar mais uma parte
    // Isso é útil se o endereço tiver, por exemplo, o número incluído na quarta parte.
    if (partesRelevantes.length < 4 && indiceRegiao > 3) {
        partesRelevantes.push(partes[3].trim()); // Tenta adicionar o que seria o número ou mais detalhes importantes
    }

    // 4. Junta as partes relevantes novamente em uma string formatada.
    return partesRelevantes.join(', ');
}
