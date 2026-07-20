import OneColumnTemplate from './OneColumnTemplate';
import SidebarTemplate from './SidebarTemplate';
import BannerTemplate from './BannerTemplate';
import HeaderTemplate from './HeaderTemplate';
import CleanTemplate from './CleanTemplate';
import SimpleTemplate from './SimpleTemplate';
import ClassicTemplate from './ClassicTemplate';
import SlateTemplate from './SlateTemplate';
import BloomTemplate from './BloomTemplate';
import PortraitTemplate from './PortraitTemplate';
import MeridianTemplate from './MeridianTemplate';

export const TEMPLATE_COMPONENTS = {
  onecolumn: OneColumnTemplate,
  sidebar: SidebarTemplate,
  banner: BannerTemplate,
  header: HeaderTemplate,
  clean: CleanTemplate,
  // Self-contained templates (own their whole look, ignore resume.settings)
  // live alongside the older shared-settings ones rather than replacing
  // them outright — existing resumes already using onecolumn/sidebar/etc.
  // keep working exactly as before.
  simple: SimpleTemplate,
  classic: ClassicTemplate,
  slate: SlateTemplate,
  bloom: BloomTemplate,
  portrait: PortraitTemplate,
  meridian: MeridianTemplate,
};