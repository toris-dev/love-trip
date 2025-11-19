"use client"

import styled from "styled-components"
import Link from "next/link"
import { Heart, Mail, Instagram, Facebook, Twitter, Github, MapPin, Phone } from "lucide-react"
import { StyledButton } from "./styled-button"
import { CONTACT_INFO, SOCIAL_LINKS } from "@lovetrip/shared/constants"

const FooterContainer = styled.footer`
  position: relative;
  background: linear-gradient(
    to bottom right,
    ${({ theme }) => theme.colors.primary}08,
    ${({ theme }) => theme.colors.background},
    ${({ theme }) => theme.colors.accent}08
  );
  border-top: 1px solid ${({ theme }) => theme.colors.border}80;
  margin-top: ${({ theme }) => theme.spacing["2xl"]};
  
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
    background-size: 20px 20px;
    opacity: 0.02;
    pointer-events: none;
  }
`

const FooterContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
  position: relative;
  z-index: 10;
`

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`

const BrandSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

const BrandLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  text-decoration: none;
  transition: transform ${({ theme }) => theme.transitions.normal};

  &:hover {
    transform: scale(1.02);
  }
`

const HeartIconWrapper = styled.div`
  position: relative;
  
  svg {
    transition: transform ${({ theme }) => theme.transitions.normal};
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: ${({ theme }) => theme.colors.primary}33;
    border-radius: 50%;
    filter: blur(12px);
    opacity: 0;
    transition: opacity ${({ theme }) => theme.transitions.normal};
  }

  ${BrandLink}:hover & {
    svg {
      transform: scale(1.1) rotate(12deg);
    }

    &::after {
      opacity: 1;
    }
  }
`

const BrandName = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(
    to right,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.accent}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const BrandDescription = styled.p`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.875rem;
  line-height: 1.6;
  margin: 0;
`

const SocialButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`

const SocialButton = styled(StyledButton).attrs({ $variant: "ghost", $size: "sm" })`
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;

  &:hover {
    background: ${({ theme }) => theme.colors.primary}10;
    transform: scale(1.1);
  }
`

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
`

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.foreground};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`

const LinkList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`

const FooterLink = styled(Link)`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.875rem;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`

const LinkDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary}00;
  transition: background ${({ theme }) => theme.transitions.fast};

  ${FooterLink}:hover & {
    background: ${({ theme }) => theme.colors.primary};
  }
`

const ContactList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: 0.875rem;
`

const ContactItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.mutedForeground};
`

const ContactIcon = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  flex-shrink: 0;
  margin-top: 2px;
`

const BottomBar = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border}80;
  padding-top: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }
`

const Copyright = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  margin: 0;
  text-align: center;

  @media (min-width: 768px) {
    text-align: left;
  }
`

const BusinessInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  flex-wrap: wrap;
  justify-content: center;

  @media (min-width: 768px) {
    justify-content: flex-end;
  }
`

const BusinessInfoItem = styled.span`
  cursor: pointer;
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`

export function StyledFooter() {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterGrid>
          {/* Brand Section */}
          <BrandSection>
            <BrandLink href="/">
              <HeartIconWrapper>
                <Heart size={32} fill="currentColor" />
              </HeartIconWrapper>
              <BrandName>LOVETRIP</BrandName>
            </BrandLink>
            <BrandDescription>
              커플을 위한 완벽한 여행 파트너
              <br />
              특별한 순간을 함께 계획하고 추억을 만들어보세요
            </BrandDescription>
            <SocialButtons>
              <SocialButton as="a" href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer">
                <Instagram size={20} />
              </SocialButton>
              <SocialButton as="a" href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer">
                <Facebook size={20} />
              </SocialButton>
              <SocialButton as="a" href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer">
                <Twitter size={20} />
              </SocialButton>
              <SocialButton as="a" href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer">
                <Github size={20} />
              </SocialButton>
            </SocialButtons>
          </BrandSection>

          {/* 서비스 */}
          <FooterSection>
            <SectionTitle>서비스</SectionTitle>
            <LinkList>
              <li>
                <FooterLink href="/">
                  <LinkDot />
                  여행 계획하기
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/my-trips">
                  <LinkDot />
                  내 여행 관리
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/about">
                  <LinkDot />
                  서비스 소개
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/contact">
                  <LinkDot />
                  문의하기
                </FooterLink>
              </li>
            </LinkList>
          </FooterSection>

          {/* 법률 정보 */}
          <FooterSection>
            <SectionTitle>법률 정보</SectionTitle>
            <LinkList>
              <li>
                <FooterLink href="/terms">
                  <LinkDot />
                  이용약관
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/privacy">
                  <LinkDot />
                  개인정보처리방침
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/contact">
                  <LinkDot />
                  고객센터
                </FooterLink>
              </li>
            </LinkList>
          </FooterSection>

          {/* 연락처 */}
          <FooterSection>
            <SectionTitle>연락처</SectionTitle>
            <ContactList>
              <ContactItem>
                <ContactIcon>
                  <Mail size={16} />
                </ContactIcon>
                <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>
              </ContactItem>
              <ContactItem>
                <ContactIcon>
                  <Phone size={16} />
                </ContactIcon>
                <a href={`tel:${CONTACT_INFO.phone}`}>{CONTACT_INFO.phone}</a>
              </ContactItem>
              <ContactItem>
                <ContactIcon>
                  <MapPin size={16} />
                </ContactIcon>
                <span>{CONTACT_INFO.address}</span>
              </ContactItem>
            </ContactList>
          </FooterSection>
        </FooterGrid>

        {/* Bottom Bar */}
        <BottomBar>
          <Copyright>
            © {new Date().getFullYear()} LOVETRIP. All rights reserved.
          </Copyright>
          <BusinessInfo>
            <BusinessInfoItem>사업자등록번호: 123-45-67890</BusinessInfoItem>
            <BusinessInfoItem>통신판매업신고: 제2024-서울강남-0000호</BusinessInfoItem>
          </BusinessInfo>
        </BottomBar>
      </FooterContent>
    </FooterContainer>
  )
}

