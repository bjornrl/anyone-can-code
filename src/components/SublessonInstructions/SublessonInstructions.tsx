import React from 'react';
import {
  Box,
  BoxProps,
  Button,
  Divider,
  Flex,
  Heading,
  Text,
} from '@chakra-ui/react';
import TestCaseResult from '../TestCaseResult/TestCaseResult';
import { runTests } from '../../CodeRunning';
import '@fontsource/roboto';
import { useReactiveVar } from '@apollo/client';
import { codeEditorValueVar } from 'src/cache';
import { SublessonInstructionsDataFragment } from 'src/generated/graphql';
import Markdown from 'components/core/Markdown';

import { styled } from 'linaria/react';
import { useAppTheme, themeStyles } from 'src/theme/theme';
import { ThemesEnum } from 'src/styles/themes/themes.types';

type StyledButtonProps = {
  backgroundColor: string;
};

type AnotherTestProps = {
  color: string;
};

const AnotherTest = styled.h1<AnotherTestProps>`
  text-transform: uppercase;

  ${themeStyles((theme) => ({
    color: theme.primaryColor,
  }))};
`;

type props = SublessonInstructionsDataFragment & {};

const SublessonInstructions: React.FC<props> = ({
  challenges,
  description,
  name,
  lesson,
}) => {
  const codeEditorValue = useReactiveVar(codeEditorValueVar);
  const currentChallenge = challenges[0];

  const [currentTheme, setAppTheme] = useAppTheme();

  return (
    <Flex
      align="baseline"
      bgColor="white"
      direction="column"
      px="20px"
      h="calc(100vh - 65px)"
    >
      <AnotherTest color="red">this is a header test</AnotherTest>
      <button
        onClick={() =>
          setAppTheme(
            currentTheme === ThemesEnum.DARK
              ? ThemesEnum.DEFAULT
              : ThemesEnum.DARK,
          )
        }
      >
        change theme
      </button>
      <Text
        casing="uppercase"
        color="#646466"
        fontSize="13px"
        mb="10px"
        mt="20px"
      >
        {lesson?.name}
      </Text>
      {console.log('the theme', currentTheme, currentTheme)}
      <Heading as="h1" fontSize="26px" fontWeight="400" mb="30px">
        {name}
      </Heading>
      <Box minH="300">
        <Markdown>{description}</Markdown>
        {/* <Text as="pre" mt="15px">
          5 + 5
        </Text> */}
      </Box>
      <Box mt="auto" w="100%">
        <Divider color="#D0D0D5" opacity="1" />
        <TestCaseResult passed label="Log 10 + 10 to the console" />
        <Button
          colorScheme="green"
          px="35px"
          py="25px"
          mt="50px"
          mb="35px"
          onClick={() =>
            runTests(codeEditorValue, [
              {
                name: "the variable 'agwefwefwefe' is defined",
                testString: "typeof agwefwefwefe !== 'undefined'",
              },
              {
                name: "the variable 'age' is defined",
                testString: "typeof age !== 'undefined'",
              },
              // {
              //   name: "age is a number",
              //   testString: "assert(typeof age === 'number')",
              // },
            ])
          }
        >
          Next
        </Button>
      </Box>
    </Flex>
  );
};

export default SublessonInstructions;
