import React, { useMemo } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import type { GridProps } from '@chakra-ui/react';
import MyIcon from '@fastgpt/web/components/common/Icon';
import type { IconNameType } from '@fastgpt/web/components/common/Icon/type.d';

// @ts-ignore
export interface Props extends GridProps {
  list: { id: string; label: string; icon: string }[];
  activeId: string;
  size?: 'sm' | 'md' | 'lg';
  onChange: (id: string) => void;
}

const SideTabs = ({ list, size = 'md', activeId, onChange, ...props }: Props) => {
  const sizeMap = useMemo(() => {
    switch (size) {
      case 'sm':
        return {
          fontSize: 'xs',
          inlineP: 1
        };
      case 'md':
        return {
          fontSize: 'sm',
          inlineP: 2
        };
      case 'lg':
        return {
          fontSize: 'md',
          inlineP: 3
        };
    }
  }, [size]);

  return (
    <Box fontSize={sizeMap.fontSize} {...props}>
      {list.map((item) => (
        <Flex
          key={item.id}
          py={sizeMap.inlineP}
          borderRadius={'md'}
          px={3}
          mb={2}
          fontWeight={'medium'}
          alignItems={'center'}
          {...(activeId === item.id
            ? {
              bg: ' rgba(51, 189, 170, 0.15) !important',
              color: 'rgba(2, 189, 170, 1) ',
              cursor: 'default'
            }
            : {
              cursor: 'pointer',
              color: 'myGray.600'
            })}
          _hover={{
            color: 'primary.600',
            bg: 'myGray.100'
          }}
          onClick={() => {
            if (activeId === item.id) return;
            onChange(item.id);
          }}
        >
          <MyIcon mr={2} name={item.icon as IconNameType} w={'20px'} />
          {item.label}
        </Flex>
      ))}
    </Box>
  );
};

export default React.memo(SideTabs);
