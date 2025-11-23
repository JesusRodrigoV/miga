import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { MgButton } from "@shared/components/mg-button";

interface BusinessPlanElement {
  icon: string;
  title: string;
  description: string;
}

interface Step {
  icon: string;
  title: string;
  description: string;
  details: string[];
}

@Component({
  selector: "app-home",
  imports: [RouterLink, MgButton, CommonModule],
  templateUrl: "./home.html",
  styleUrl: "./home.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export default class Home {
  businessPlanElements: BusinessPlanElement[] = [
    {
      icon: 'storefront',
      title: 'Tu Producto',
      description: 'Descubre qué hace especial a tu negocio y cómo compartirlo con el mundo.'
    },
    {
      icon: 'people',
      title: 'Tus Clientes',
      description: 'Conoce a las personas que necesitan lo que ofreces y cómo ayudarles.'
    },
    {
      icon: 'construct',
      title: 'Tu Forma de Trabajar',
      description: 'Organiza cómo harás realidad tu producto o servicio día a día.'
    },
    {
      icon: 'wallet',
      title: 'Tu Inversión',
      description: 'Entiende cuánto necesitas para empezar y mantener tu negocio.'
    },
    {
      icon: 'trending-up',
      title: 'Tu Ganancia',
      description: 'Visualiza cómo tu esfuerzo se convierte en ingresos y crecimiento.'
    }
  ];

  steps: Step[] = [
    {
      icon: 'bulb-outline',
      title: 'Comparte tu Idea',
      description: 'Cuéntanos qué quieres hacer. No importa si aún está en tu mente, aquí le damos forma juntas.',
      details: [
        'Describe tu idea con tus propias palabras',
        'Piensa en quién necesita lo que ofreces',
        'Identifica qué te hace diferente'
      ]
    },
    {
      icon: 'flag-outline',
      title: 'Define tus Metas',
      description: 'Sueña en grande pero empieza paso a paso. Vamos a crear objetivos que puedas alcanzar.',
      details: [
        'Establece metas para los próximos meses',
        'Visualiza dónde quieres estar',
        'Identifica tus primeros logros'
      ]
    },
    {
      icon: 'calculator-outline',
      title: 'Organiza tus Números',
      description: 'Sin complicaciones. Te ayudamos a entender cuánto necesitas y cómo administrarlo.',
      details: [
        'Lista lo que necesitas para empezar',
        'Calcula tus gastos mensuales',
        'Define precios justos',
        'Planifica tus ingresos'
      ]
    },
    {
      icon: 'rocket-outline',
      title: '¡A Emprender!',
      description: 'Con tu plan listo, es momento de dar el gran paso. Te acompañamos en el camino.',
      details: [
        'Define cómo dar a conocer tu negocio',
        'Encuentra tus canales de venta',
        'Planifica estrategias de marketing'
      ]
    }
  ];
}
